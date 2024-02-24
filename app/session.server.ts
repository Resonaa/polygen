import { createCookieSessionStorage } from "@remix-run/node";
import bcrypt from "bcryptjs";

import { access } from "~/access";
import { SESSION_SECRET } from "~/env.server";
import type { User } from "~/models/user.server";
import { getUser as getUserFromDb } from "~/models/user.server";
import { forbidden } from "~/reponses.server";

/**
 * Stores session data in cookie.
 */
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET]
  }
});

export const USER_SESSION_KEY = "username";
export const CAPTCHA_SESSION_KEY = "captcha";

/**
 * Gets or creates the associated session for a request.
 */
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return await sessionStorage.getSession(cookie);
}

/**
 * Tries to get username from a request. Returns undefined if not exists.
 */
export async function getUsername(request: Request) {
  const session = await getSession(request);
  return (await session.get(USER_SESSION_KEY)) as User["username"] | undefined;
}

/**
 * Tries to get captcha from a request. Returns undefined if not exists.
 */
export async function getCaptcha(request: Request) {
  const session = await getSession(request);
  return (await session.get(CAPTCHA_SESSION_KEY)) as string | undefined;
}

/**
 * Tries to get user data from a request. Returns undefined if not exists.
 *
 * If username is found but the user doesn't actually exist in database,
 * a response will be thrown to log the user out.
 */
export async function getUser(request: Request) {
  const username = await getUsername(request);
  if (username === undefined) {
    return null;
  }

  const user = await getUserFromDb(username);
  if (user) {
    return user;
  }

  throw await logout(request);
}

/**
 * Requires the user of a request have a particular access. Throws 403 if failed.
 */
export async function requireUser(request: Request, required: number) {
  const user = await getUser(request);

  if (user && access(user, required)) {
    return user;
  }

  throw forbidden;
}

/**
 * Requires the user (access level 0 if not exists) of a request have a particular access.
 * Throws 403 if failed.
 */
export async function requireOptionalUser(request: Request, required: number) {
  const user = await getUser(request);

  if (access(user, required)) {
    return user;
  }

  throw forbidden;
}

/**
 * Creates user session for the request.
 */
export async function createUserSession(request: Request, username: string) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, username);
  session.unset(CAPTCHA_SESSION_KEY);

  return new Response(null, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }
  });
}

/**
 * Creates captcha session for the request.
 */
export async function createCaptchaSession(
  request: Request,
  captcha: string,
  data: string
) {
  const session = await getSession(request);
  session.flash(CAPTCHA_SESSION_KEY, captcha);
  return new Response(data, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
      "Content-Type": "image/svg+xml"
    }
  });
}

/**
 * Verifies captcha for the request.
 */
export async function verifyCaptcha(request: Request, captcha: string) {
  const realCaptcha = await getCaptcha(request);
  return realCaptcha && realCaptcha.toUpperCase() === captcha.toUpperCase();
}

/**
 * Logs the user out.
 */
export async function logout(request: Request) {
  const session = await getSession(request);
  return new Response(null, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}

/**
 * Gets the hash value of the password.
 */
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compares the password against the hash value.
 */
export async function comparePassword(input: string, hash: string) {
  return await bcrypt.compare(input, hash);
}
