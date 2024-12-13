import type { ActionFunction, SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import { decode } from "turbo-stream";

import type { loader } from "~/root";

/**
 * Tries to get the current user from loader data. Returns undefined if not found.
 */
export function useOptionalUser() {
  return useRouteLoaderData<typeof loader>("root").user;
}

/**
 * Gets the current user from loader data. Throws an error if not found.
 */
export function useUser() {
  const maybeUser = useOptionalUser();

  if (!maybeUser) {
    throw new Error();
  }

  return maybeUser;
}

/**
 * Gets current server time from loader data.
 */
export function useServerTime() {
  return useRouteLoaderData<typeof loader>("root").time;
}

/**
 * Calls API routes with data.
 */
export async function load<Action extends ActionFunction>(
  url: string,
  data: object
) {
  const body = new FormData();

  for (const [key, value] of Object.entries(data)) {
    body.append(key, value);
  }

  const options = { method: "post", body };

  return (await decode((await fetch(url, options)).body!))
    .value as SerializeFrom<Action>;
}
