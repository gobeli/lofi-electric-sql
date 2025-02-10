import { createContext, type Resource } from "solid-js"
import type { useListWithWrites } from "../../storage/writes.ts"
import type { User } from "better-auth";
import type { Entity } from "@app/backend";

export type Recipe = Entity & {
  name: string;
  instructions: string;
}

export const RecipeContext = createContext<ReturnType<typeof useListWithWrites<Recipe>>>()
export const UserContext = createContext<Resource<User | undefined>>();