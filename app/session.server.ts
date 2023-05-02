import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserWithoutPasswordByUsername } from "~/models/user.server";
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
export const CAPTCHA_SESSION_KEY = "captcha";

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

export async function getCaptcha(
  request: Request
): Promise<string | undefined> {
  const session = await getSession(request);
  return session.get(CAPTCHA_SESSION_KEY);
}

export async function getUser(request: Request) {
  const username = await getUsername(request);
  if (username === undefined) return null;

  const user = await getUserWithoutPasswordByUsername(username);
  if (user) return user;

  throw await logout(request, request.url);
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

  const user = await getUserWithoutPasswordByUsername(username);
  if (user) return user;

  throw await logout(request, request.url);
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

export async function createCaptchaSession(request: Request, captcha: string, data: string) {
  const session = await getSession(request);
  session.set(CAPTCHA_SESSION_KEY, captcha);
  return new Response(data, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
      "Content-Type": "image/svg+xml"
    }
  });
}

export async function verifyCaptcha(request: Request, captcha: string) {
  const realCaptcha = await getCaptcha(request);
  return realCaptcha && realCaptcha.toUpperCase() === captcha.toUpperCase();
}

export async function logout(request: Request, redirectTo: string) {
  const session = await getSession(request);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}

/**
 * Validate the given username.
 * @param username Anything that could be a username
 */
export function validateUsername(username: unknown): username is string {
  return typeof username === "string" && /^[\u4e00-\u9fa5_a-zA-Z0-9]{3,16}$/.test(username);
}

/**
 * Validate the given password.
 * @param password Anything that could be a password
 */
export function validatePassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 6;
}

export function validateCaptcha(captcha: unknown): captcha is string {
  return typeof captcha === "string" && captcha.length === 4;
}

/**
 * Hash the given password.
 * @param password The given password
 * @returns Hash value of the password
 */
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

/**
 * Check if the password matches the hash value.
 * @param input The given password
 * @param hash The given hash value to compare against
 */
export function comparePassword(input: string, hash: string) {
  return bcrypt.compare(input, hash);
}