import { createAuthClient } from "better-auth/solid";

export const authClient = createAuthClient({
  baseURL: globalThis.location.origin + "/api/auth",
});
