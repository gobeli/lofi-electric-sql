import { ParentComponent, Show } from "solid-js";

export type FormControlProps = {
  label: string;
  error?: string[];
  name: string;
};

export const FormControl: ParentComponent<FormControlProps> = (props) => (
  <label class="form-control | flex flex-col">
    <div class="label">
      <span class="label-text | text-xs">{props.label}</span>
    </div>
    {props.children}
    <Show when={props.error}>
      {(error) => (
        <div class="label">
          <span class="label-text-alt text-error">{error()[0]}</span>
        </div>
      )}
    </Show>
  </label>
);
