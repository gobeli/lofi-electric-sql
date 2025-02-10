import type { useListWithWrites } from "../../../storage/writes.ts";
import { createContext } from "solid-js";
import type { Schedule } from "@app/backend";

export const MenuPrepContext =
  createContext<ReturnType<typeof useListWithWrites<Schedule>>>();
