import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import type { User } from "~/models/user.server";
import bcrypt from "bcryptjs";
import type { IOptions } from "glob";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
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

function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");

  if (!data || !isUser(data.user)) {
    return undefined;
  }

  return data.user;
}

export function validateUsername(username: unknown): username is string {
  return typeof username === "string" && /^[\u4e00-\u9fa5_a-zA-Z0-9]{3,16}$/.test(username);
}

export function validatePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6;
}

export async function ajax(method: string, url: string, data: any) {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };

  return (await (await fetch(url, options)).json()).data;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(input: string, hash: string) {
  return bcrypt.compare(input, hash);
}

export const enum Access {
  VisitWebsite = 0,

  Community = 1,
  PlayGame = 1,

  ManageCommunity = 2,
  ManageAccess = 2,

  ManageAnnouncement = 3,
  ManageUser = 3,
  ManageGame = 3,

  ManageServer = 4,
  ManageDb = 4,
}

export function useAuthorizedOptionalUser(access: Access) {
  const maybeUser = useOptionalUser();

  if ((maybeUser ? maybeUser.access : 0) < access) {
    throw new Error("权限不足");
  }

  return maybeUser;
}

export function useAuthorizedUser(access: Access): User {
  const maybeUser = useAuthorizedOptionalUser(access);

  if (!maybeUser) {
    throw new Error("用户未找到");
  }

  return maybeUser;
}

export const vditorConfig = {
  height: 160,
  toolbar: [
    "upload",
    "record",
    "|",
    "undo",
    "redo",
    "|",
    "fullscreen",
    {
      name: "more",
      toolbar: [
        "both",
        "edit-mode",
        "export",
        "outline",
        "preview"
      ]
    }
  ],
  toolbarConfig: {
    pin: true
  },
  resize: {
    enable: true
  },
  tab: "    ",
  preview: {
    math: {
      inlineDigit: true
    }
  }
} as IOptions;