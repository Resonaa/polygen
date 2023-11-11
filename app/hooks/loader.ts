import type { ActionFunction, SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";

import type { loader } from "~/root";

function isLoaderData(data: unknown): data is SerializeFrom<typeof loader> {
  return typeof data === "object" && !!data && "user" in data && "time" in data;
}

export function useOptionalUser() {
  const data = useRouteLoaderData("root");

  if (isLoaderData(data)) {
    return data.user;
  }
}

export function useUser() {
  const maybeUser = useOptionalUser();

  if (!maybeUser) {
    throw new Error();
  }

  return maybeUser;
}

export function useServerTime() {
  const data = useRouteLoaderData("root");

  if (isLoaderData(data)) {
    return new Date(data.time);
  }

  throw new Error();
}

// Calls API routes with data
export async function load<Action extends ActionFunction>(
  url: string,
  data: object
) {
  const body = new FormData();

  for (const [key, value] of Object.entries(data)) {
    body.append(key, value);
  }

  const options = { method: "post", body };

  return (await (await fetch(url, options)).json()) as SerializeFrom<Action>;
}
