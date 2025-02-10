import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export const db = drizzle({
  client: new pg.Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  }),
});
