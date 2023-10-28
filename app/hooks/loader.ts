import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

export function useMatchesData(id: string) {
  const matchingRoutes = useMatches();

  const route = useMemo(
    () => matchingRoutes.find(route => route.id === id),
    [matchingRoutes, id]
  );

  return route?.data;
}

function isLoaderData(data: unknown): data is object {
  return typeof data === "object";
}

function isUser(user: unknown): user is User {
  return (
    typeof user === "object" &&
    !!user &&
    "username" in user &&
    typeof user.username === "string"
  );
}

function isServerTime(time: unknown): time is number {
  return typeof time === "number";
}

export function useOptionalUser() {
  const data = useMatchesData("root");

  if (isLoaderData(data) && "user" in data && isUser(data.user)) {
    return data.user as User;
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
  const data = useMatchesData("root");

  if (isLoaderData(data) && "time" in data && isServerTime(data.time)) {
    return new Date(data.time);
  }

  throw new Error();
}
