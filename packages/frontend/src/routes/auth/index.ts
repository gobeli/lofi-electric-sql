import { type RouteDefinition, useNavigate } from "@solidjs/router";
import { lazy } from "solid-js";
import { authClient } from "../../lib/auth-client.ts";

export const loggedInGuard = async () => {
  const navigate = useNavigate();
  const session = await authClient.getSession();

  if (session.data) {
    navigate('/app/schedule')
  }
}

export const authRoutes: RouteDefinition[] = [
  {
    path: '/login',
    component: lazy(() => import('./login.tsx')),
  },
  {
    path: '/register',
    component: lazy(() => import('./login.tsx')),
  },
]
