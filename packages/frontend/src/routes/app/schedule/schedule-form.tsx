import { FormControl } from "../../../ui/form-control.tsx";
import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  Show,
  useContext,
} from "solid-js";
import { action, useSubmission } from "@solidjs/router";
import { format, isAfter, isBefore, subMonths } from "date-fns";
import { ScheduleSchema, type Schedule } from "@app/backend";
import { MenuPrepContext } from "./shared.ts";

const MenuFormSchema = ScheduleSchema.pick({ recipe: true, date: true });

const menuFormAction = action(
  (data) => MenuFormSchema.parseAsync(Object.fromEntries(data)),
  { name: "menuFormAction" },
);

export const ScheduleForm = (props: {
  value?: Schedule;
  date?: Date;
  onSave: (toSave: Schedule) => void;
}) => {
  const store = useContext(MenuPrepContext);
  const submission = useSubmission(menuFormAction);
  const [recipe, setRecipe] = createSignal(props.value?.recipe);
  const [submitted, setSubmitted] = createSignal(false);

  const recipes = () =>
    store
      ?.state()
      ?.reduce(
        (acc, next) =>
          acc.some((r) => r === next.recipe) ? acc : [...acc, next.recipe as string],
        [] as string[],
      );
  const recipeCount = () =>
    store
      ?.state()
      .filter(
        (s) =>
          isAfter(s.date, subMonths(new Date(), 1)) &&
          isBefore(s.date, new Date()) &&
          s.id !== props.value?.id,
      )
      .reduce(
        (acc, next) => ({
          ...acc,
          [next.recipe as string]: acc[next.recipe as string ] ? acc[next.recipe as string] + 1 : 1,
        }),
        {} as { [key: string]: number },
      );

  createEffect(() => {
    if (!submission.result) return;

    props.onSave({ sort: 0, ...props.value, ...submission.result } as Schedule);
  });

  onCleanup(() => {
    submission.clear();
  });

  return (
    <form
      class="space-y-1"
      action={menuFormAction}
      method="post"
      onSubmit={() => setSubmitted(true)}
    >
      <FormControl
        label="Recipe"
        name="recipe"
        error={submitted() && submission.error?.format()?.recipe?._errors}
      >
        <input
          list="recipes"
          class="input input-bordered input-sm"
          type="text"
          name="recipe"
          value={props.value?.recipe ?? ""}
          onBlur={(e) => setRecipe(e.target.value)}
        />
        <datalist id="recipes">
          <For each={recipes() ?? []}>
            {(item) => <option value={item}></option>}
          </For>
        </datalist>
        <Show when={recipeCount()?.[recipe() ?? ""]}>
          {(count) => (
            <p class="label text-xs | whitespace-break-spaces">
              You had "{recipe()}" {count()} times last month.
            </p>
          )}
        </Show>
      </FormControl>
      <FormControl
        label="Date"
        name="date"
        error={submitted() && submission.error?.format()?.date?._errors}
      >
        <input
          class="input input-bordered input-sm"
          type="date"
          name="date"
          value={format(
            props.value?.date ?? props.date ?? new Date(),
            "yyyy-MM-dd",
          )}
        />
      </FormControl>
      <div class="flex justify-end">
        <button type="submit" class="btn btn-xs">
          Save
        </button>
      </div>
    </form>
  );
};
