import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import { padZero } from "~/components/community";
import type { User } from "~/models/user.server";

export function useMatchesData(id: string) {
  const matchingRoutes = useMatches();

  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );

  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.username === "string";
}

function isServerTime(time: any): time is number {
  return time && typeof time === "number";
}

export function useOptionalUser() {
  const data = useMatchesData("root");

  if (!data || !isUser(data.user)) {
    return undefined;
  }

  return data.user as User;
}

export function useUser() {
  const maybeUser = useOptionalUser();

  if (!maybeUser) {
    throw new Error("用户不存在");
  }

  return maybeUser;
}

export function useServerTime() {
  const data = useMatchesData("root");

  if (!data || !isServerTime(data.time)) {
    throw new Error("获取服务器时间失败");
  }

  return new Date(data.time);
}

export async function ajax(method: string, url: string, data: Record<string, number | string | boolean> = {}) {
  const body = new FormData();

  for (const key in data) {
    body.append(key, data[key].toString());
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