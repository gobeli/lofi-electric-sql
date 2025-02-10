import {
  addDays,
  addWeeks,
  getISOWeek,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { createSignal, For, Show } from "solid-js";
import { ChevronLeft } from "../../../ui/icons/chevron-left.tsx";
import { ChevronRight } from "../../../ui/icons/chevron-right.tsx";
import { useListWithWrites } from "../../../storage/writes.ts";
import { ScheduleForm } from "./schedule-form.tsx";
import type { Schedule } from "@app/backend";
import { MenuPrepContext } from "./shared.ts";

type EditingState =
  | { state: "idle" }
  | { state: "editing"; id: string }
  | { state: "adding"; date: Date };
const IDLE: EditingState = { state: "idle" };

const _startOfWeek = (date: Date) => startOfWeek(date, { weekStartsOn: 1 });

const weekdayFormat = new Intl.DateTimeFormat("en-CH", { weekday: "short" });
const monthFormat = new Intl.DateTimeFormat("en-CH", { month: "long" });

const ScheduleHeader = (props: {
  days: Date[];
  onWeekChange: (add: number) => void;
  onDateChange: (date: Date) => void;
}) => (
  <div class="p-2 flex gap-1 flex-col md:flex-row justify-between">
    <div class="flex items-center gap-2">
      <div class="text-xl">
        <span class="text-primary">{monthFormat.format(props.days[0])}</span>{" "}
        {props.days[0].getFullYear()}
      </div>
      <div class="badge badge-ghost">Week {getISOWeek(props.days[0])}</div>
    </div>
    <div class="flex items-center justify-end">
      <button aria-label="Previous week" onClick={() => props.onWeekChange(-1)}>
        <ChevronLeft />
      </button>
      <button aria-label="Next week" onClick={() => props.onWeekChange(1)}>
        <ChevronRight />
      </button>
      <button
        class="btn btn-sm ml-1"
        onClick={() => props.onDateChange(new Date())}
      >
        Today
      </button>
    </div>
  </div>
);

const ScheduleDay = (props: {
  date: Date;
  items: Schedule[];
  editingState: EditingState;
  save: (toSave: Schedule) => void;
  edit: (id: string) => void;
  cancel: () => void;
}) => (
  <>
    <For each={props.items}>
      {(item) => (
        <div
          class="bg-neutral py-0.5 px-1 rounded-box text-sm"
          onClick={() => props.edit(item.id)}
        >
          <Show
            when={
              props.editingState.state === "editing" &&
              item.id === props.editingState.id
            }
            fallback={<>{item.recipe}</>}
          >
            <ScheduleForm value={item} onSave={props.save}></ScheduleForm>
          </Show>
        </div>
      )}
    </For>
    <Show
      when={
        props.editingState.state === "adding" &&
        isSameDay(props.date, props.editingState.date)
      }
    >
      <div class="bg-neutral py-0.5 px-1 rounded-box text-sm">
        <ScheduleForm onSave={props.save} date={props.date}></ScheduleForm>
      </div>
    </Show>
  </>
);

const Schedule = () => {
  const store = useListWithWrites<Schedule>("schedule");
  const [startDay, setStartDay] = createSignal(_startOfWeek(new Date()));
  const [editingState, setEditingState] = createSignal<EditingState>(IDLE);

  const days = (): Date[] =>
    Array(7)
      .fill(startDay())
      .map((val, i) => addDays(val, i));
  const items = () =>
    days().map((day) =>
      store
        .state()
        .filter((s) => isSameDay(day, s.date))
        .sort((a, b) => a.sort - b.sort),
    );

  function save(item: Schedule) {
    store.upsert(item);
    setEditingState(IDLE);
  }

  return (
    <MenuPrepContext.Provider value={store}>
      <div class="flex-1 flex flex-col h-full">
        <ScheduleHeader
          days={days()}
          onWeekChange={(add) => setStartDay((d) => addWeeks(d, add))}
          onDateChange={(date) => setStartDay(_startOfWeek(date))}
        />
        <div class="flex-1 flex">
          <For each={days()}>
            {(day, index) => (
              <div class="flex-1 min-w-32 md:min-w-40 flex flex-col">
                <div
                  class="border-neutral border-b text-center pb-2"
                  classList={{ "text-primary": isSameDay(day, new Date()) }}
                >
                  <p class="uppercase text-xs">{weekdayFormat.format(day)}</p>
                  <h3 class="text-xl">{day.getDate()}</h3>
                </div>
                <div class="flex-1 group space-y-1 px-0.5 pt-1">
                  <ScheduleDay
                    date={day}
                    items={items()[index()]}
                    save={(item) => save(item)}
                    edit={(id) => setEditingState({ state: "editing", id })}
                    cancel={() => setEditingState(IDLE)}
                    editingState={editingState()}
                  />
                  <Show when={editingState() === IDLE}>
                    <button
                      class="btn btn-sm w-full md:hidden group-hover:block"
                      onClick={() =>
                        setEditingState({ state: "adding", date: day })
                      }
                    >
                      + Add
                    </button>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </MenuPrepContext.Provider>
  );
};

export default Schedule;
