/* @refresh reload */
import { render } from "solid-js/web";
import "./style.css";
import { Router, type RouteDefinition } from "@solidjs/router";
import { authRoutes, loggedInGuard } from "./routes/auth/index.ts";
import { appRoutes } from "./routes/app/index.tsx";
import { lazy } from "solid-js";

const root = document.getElementById("root");

const routes: RouteDefinition[] = [
  {
    path: "/auth",
    children: authRoutes,
    preload: loggedInGuard,
  },
  {
    path: "/app",
    component: lazy(() => import("./routes/app/index.tsx")),
    children: appRoutes,
  },
];

render(() => <Router>{routes}</Router>, root!);
