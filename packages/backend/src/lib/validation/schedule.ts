import { z } from "zod";
import {
  DateSchema,
  NumberFieldSchema,
  TextFieldSchema,
} from "./shared.ts";

export const ScheduleSchema = z.object({
  id: z.string().uuid(),
  created_at: DateSchema(),
  updated_at: DateSchema().optional(),
  date: DateSchema(),
  sort: NumberFieldSchema(0),
  recipe: TextFieldSchema(30),
  last_write_id: z.string().uuid(),
  user_id: z.string().optional(),
});

export type Schedule = z.infer<typeof ScheduleSchema>;
export type PartialSchedule = Omit<Schedule, 'id' | 'created_at'>;
