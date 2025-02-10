import {
  A,
  action,
  useLocation,
  useNavigate,
  useSubmission,
} from "@solidjs/router";
import { authClient } from "../../lib/auth-client.ts";
import { createMemo, Show } from "solid-js";
import { effect } from "solid-js/web";
import { FormControl } from "../../ui/form-control.tsx";

const loginAction = action(async (data) => {
  const body = {
    email: data.get("email"),
    password: data.get("password"),
    name: data.get("name"),
  };

  const fn = body.name
    ? () => authClient.signUp.email(body)
    : () => authClient.signIn.email(body);

  const res = await fn();
  if (res.error) {
    throw res.error;
  }

  return res.data;
});

export default function Login() {
  const submission = useSubmission(loginAction);
  const location = useLocation();
  const navigate = useNavigate();

  const type = createMemo(
    () => location.pathname.split("/").at(-1) as "login" | "register",
  );
  const link = () => {
    return {
      link: type() === "login" ? "/auth/register" : "/auth/login",
      text: type() === "login" ? "Register here" : "Already have an account?",
    };
  };

  effect(() => {
    if (submission.result?.user) {
      navigate("/app/schedule");
    }
  });

  return (
    <main class="max-w-xs m-auto">
      <h1 class="text-center text-xl">Login</h1>
      <form class="space-y-1" action={loginAction} method="post">
        <FormControl label="Email" name="email">
          <input
            class="input input-bordered input-sm"
            type="text"
            name="email"
          />
        </FormControl>
        <Show when={type() === "register"}>
          <FormControl label="Name" name="name">
            <input
              class="input input-bordered input-sm"
              type="text"
              name="name"
            />
          </FormControl>
        </Show>
        <FormControl label="Password" name="password">
          <input
            class="input input-bordered input-sm"
            type="password"
            name="password"
          />
        </FormControl>
        <button class="btn w-full" type="submit">
          Login
        </button>
        <A href={link().link}>{link().text}</A>
        <Show when={submission.error}>
          <p class="error center">{submission.error.message}</p>
        </Show>
      </form>
    </main>
  );
}
