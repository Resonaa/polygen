import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserByUsername } from "~/models/user.server";
import type { Access } from "~/utils";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET]
  }
});

export const USER_SESSION_KEY = "username";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUsername(
  request: Request
): Promise<User["username"] | undefined> {
  const session = await getSession(request);
  return session.get(USER_SESSION_KEY);
}

export async function getUser(request: Request) {
  const username = await getUsername(request);
  if (username === undefined) return null;

  const user = await getUserByUsername(username);
  if (user) return user;

  throw await logout(request);
}

async function requireUsername(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const username = await getUsername(request);
  if (!username) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return username;
}

async function requireUser(request: Request) {
  const username = await requireUsername(request);

  const user = await getUserByUsername(username);
  if (user) return user;

  throw await logout(request);
}

export async function requireAuthenticatedUser(request: Request, access: Access) {
  const user = await requireUser(request);

  if (user.access < access)
    throw new Response(`权限不足 (expected ${access}+, got ${user.access})`, { status: 403, statusText: "Forbidden" });

  return user;
}

export async function requireAuthenticatedOptionalUser(request: Request, access: Access) {
  const user = await getUser(request);

  const userAccess = user ? user.access : 0;

  if (userAccess < access)
    throw new Response(`权限不足 (expected ${access}+, got ${userAccess})`, { status: 403, statusText: "Forbidden" });

  return user;
}

export async function createUserSession(request: Request, username: string, redirectTo: string) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, username);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}
