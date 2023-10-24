import {
  useFetchers,
  useMatches,
  useNavigation,
  useRevalidator
} from "@remix-run/react";
import nProgress from "nprogress";
import { useEffect, useMemo } from "react";

import { padZero } from "~/components/community";
import type { User } from "~/models/user.server";

nProgress.configure({ showSpinner: false, trickleSpeed: 161 });

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

export async function ajax(
  method: string,
  url: string,
  data: Record<string, number | string | boolean | undefined | null> = {}
) {
  const body = new FormData();

  for (const key in data) {
    body.append(key, String(data[key]));
  }

  const options = { method: method, body };

  return await (await fetch(url, options)).json();
}

export function numberColorToString(color: number) {
  return `#${padZero(color.toString(16), 6)}`;
}

export function stringColorToNumber(color: string) {
  return Number(color.replace("#", "0x"));
}

function useGlobalLoadingState() {
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const revalidator = useRevalidator();

  const states = [
    navigation.state,
    revalidator.state,
    ...fetchers.map(fetcher => fetcher.state)
  ];

  if (states.includes("submitting")) {
    return "submitting";
  } else if (states.includes("loading")) {
    return "loading";
  } else {
    return "idle";
  }
}

export function useNProgress() {
  const state = useGlobalLoadingState();

  useEffect(() => {
    if (state === "idle") {
      nProgress.done();
    } else {
      nProgress.start();
    }
  }, [state]);
}
