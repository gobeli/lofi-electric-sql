import { createSignal, createEffect } from "solid-js";

export function createLocalStorageSignal<T>(key: string, defaultData?: T) {
  const storedData = localStorage.getItem(key);
  const [state, setState] = createSignal<T>(storedData ? JSON.parse(storedData) : defaultData);

  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(state()));
  });

  return [state, setState];
}