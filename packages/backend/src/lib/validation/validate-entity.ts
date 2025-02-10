import type { ZodObject } from "better-auth";
import { z } from "zod";
import { type TableName, tables } from "../constants.ts";
import type { Entity } from "./shared.ts";
import assert from "node:assert";
import { ScheduleSchema } from "./schedule.ts";

type Operation = `insert` | `update` | `delete`;

type WriteBody<T extends Entity> = {
  operation: Operation;
  value: T;
  table: TableName;
};

export const schemas = { schedule: ScheduleSchema };

const tableSchema = (table: TableName) =>
  z.object({
    operation: z.enum(["insert", "update", "delete"]),
    value: schemas[table] as ZodObject<any>,
    table: z.enum(tables),
  });

export function validateWrite<T extends Entity>(body?: WriteBody<T>) {
  assert(body?.table, "Table cannot be empty");

  const schema = tableSchema(body.table);
  return schema.parse(body);
}
