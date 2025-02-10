import { z } from "zod";

const invalid_type_error = "Invalid type provided for this field";
const required_error = "This field cannot be blank";

export const TextFieldSchema = (max: number) =>
  z
    .string({ invalid_type_error, required_error })
    .min(1, "Too short")
    .max(max, "Too long");

export const DateSchema = () =>
  z.coerce.date().transform((val) => new Date(val));

export const NumberFieldSchema = (min: number) =>
  z.number({ coerce: true }).min(min);

export const IdSchema = () => z.string().optional();

export type Entity = {
  id?: string;
  last_write_id?: string;
  user_id?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type PartialEntity<T extends Entity> = Omit<T, 'id' | 'created_at' | 'updated_at' | 'last_write_id' | 'user_id'>;