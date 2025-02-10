import { z } from "zod";

const invalid_type_error = 'Invalid type provided for this field';
const required_error = 'This field cannot be blank';

export const TextFieldSchema = (max: number) => z.string({ invalid_type_error, required_error }).min(1, 'Too short').max(max, 'Too long');

export const DateSchema = () => z.date({ coerce: true });

export const NumberFieldSchema = (min: number) => z.number({ coerce: true }).min(min);

export const IdSchema = () => z.string().optional();

