import { createCookieSessionStorage } from "@remix-run/node";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

import type Access from "~/access";
import { access } from "~/access";
import type { User } from "~/models/user.server";
import { getUser as getUserFromDb } from "~/models/user.server";
import { forbidden } from "~/reponses.server";

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
  return await sessionStorage.getSession(cookie);
}

export async function getUsername(
  request: Request
): Promise<User["username"] | undefined> {
  const session = await getSession(request);
  return await session.get(USER_SESSION_KEY);
}

export async function getCaptcha(
  request: Request
): Promise<string | undefined> {
  const session = await getSession(request);
  return await session.get(CAPTCHA_SESSION_KEY);
}

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

export async function requireAuthenticatedUser(
  request: Request,
  required: Access
) {
  const user = await getUser(request);

  if (user && access(user, required)) {
    return user;
  }

  throw forbidden();
}

export async function requireAuthenticatedOptionalUser(
  request: Request,
  required: Access
) {
  const user = await getUser(request);

  if (access(user, required)) {
    return user;
  }

  throw forbidden();
}

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

export async function verifyCaptcha(request: Request, captcha: string) {
  const realCaptcha = await getCaptcha(request);
  return realCaptcha && realCaptcha.toUpperCase() === captcha.toUpperCase();
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return new Response(null, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(input: string, hash: string) {
  return bcrypt.compare(input, hash);
}
