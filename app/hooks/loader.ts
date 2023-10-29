import type { LoaderFunction, TypedResponse } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";

import type { loader } from "~/root";

type LoaderReturn<T extends LoaderFunction> = ReturnType<T> extends Promise<
  TypedResponse<infer R>
>
  ? R
  : never;

function isLoaderData(data: unknown): data is LoaderReturn<typeof loader> {
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
