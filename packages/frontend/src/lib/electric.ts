import { ShapeStream, type Row, Shape } from '@electric-sql/client';
import type { Entity } from '../storage/writes';

export function getShape<T extends Entity>(table: string) {
  const stream = new ShapeStream<Row<T>>({
    url: globalThis.location.origin + `/api/electric-proxy`,
    // url: 'http://localhost:3100/v1/shape',
    params: {
      table,
    },
    fetchClient: (input, init) => fetch(input, { ...init, credentials: "same-origin" })
  });

  return new Shape(stream);
}
