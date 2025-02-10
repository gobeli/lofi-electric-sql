import { createSignal } from "solid-js";

export default function useIsOffline() {
  const [offline, setOffline] = createSignal(!navigator.onLine);

  console.log('adding listeners')
  globalThis.addEventListener('online', () => {
    setOffline(false);
  });

  globalThis.addEventListener('offline', () => {
    console.log('offline', true);
    setOffline(true);
  });

  return offline;
}
