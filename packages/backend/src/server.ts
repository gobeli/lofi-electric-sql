import { requiredUserMiddleware } from "./middleware/auth.middleware.ts";
import { Hono } from "hono";
import { auth } from "./lib/auth/auth.ts";
import { db } from "./lib/db/index.ts";
import { validator } from "hono/validator";
import { validateWrite } from "./lib/validation/validate-entity.ts";
import { entities } from "./lib/db/schema.ts";
import type { TableName } from "./lib/constants.ts";
import { eq } from "drizzle-orm/expressions";
import { AssertionError } from "node:assert";
import { ZodError } from "zod";
import type { Entity } from "./lib/validation/shared.ts";

const server = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

server.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

server.use("/api/*", requiredUserMiddleware);
server.get("/api/electric-proxy", async (c) => {
  const user = c.get("user")!;

  const originUrl = new URL(`${Deno.env.get("ELECTRIC_URL")}/v1/shape`);
  Object.entries(c.req.query()).forEach(([key, value]) => {
    if (
      [`live`, `table`, `handle`, `offset`, `cursor`].includes(key) &&
      value
    ) {
      originUrl.searchParams.set(key, value);
    }
  });

  originUrl.searchParams.set(`where`, `"user_id"= '${user.id}'`);

  const resp = await fetch(originUrl);
  const headers = new Headers(resp.headers);

  if (resp.headers.get(`content-encoding`)) {
    headers.delete(`content-encoding`);
    headers.delete(`content-length`);
  }

  return new Response(resp.body, {
    headers,
    status: resp.status,
  });
});

server.post("/api/write", validator("json", validateWrite), async (c) => {
  const body = c.req.valid("json");
  const user = c.get("user")!;

  const value = {
    ...body.value,
    user_id: user.id,
    updated_at: new Date(),
  } as Entity;

  const table = entities[body.table as TableName]!;
  switch (body.operation) {
    case "insert":
      await db.insert(table).values(value).execute();
      break;
    case "update":
      await db.update(table).set(value).where(eq(table.id, value.id)).execute();
      break;
    case "delete":
      await db.delete(table).where(eq(table.id, value.id)).execute();
      break;
  }

  return c.body(null, 204);
});

server.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json(err, 400);
  }

  if (err instanceof AssertionError) {
    return c.text(err.message, 400);
  }

  console.log("Unhandled error occured", err);

  return c.text("Internal Server Error", 500);
});

Deno.serve({ port: 3000 }, server.fetch);
