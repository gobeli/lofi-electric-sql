import type { Session, User } from "better-auth/types";
import { auth } from "../lib/auth/auth.ts";
import type { Context, Next } from "hono";

export const requiredUserMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.text("unauthorized", 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};

export const userInfo = (user: User | null, session: Session | null) => {
  return {
    user: user,
    session: session,
  };
};
