import invariant from "tiny-invariant";

import type { ServerSocket } from "~/core/types";
import { getUser } from "~/models/user.server";
import { sessionStorage, USER_SESSION_KEY } from "~/session.server";

export async function identify(socket: ServerSocket) {
  const cookie = socket.request.headers.cookie;

  if (!cookie) {
    return null;
  }

  const secret = process.env.SESSION_SECRET;

  invariant(secret);

  if (cookie.startsWith(secret)) {
    return cookie.substring(secret.length);
  }

  const username = (await sessionStorage.getSession(cookie)).get(
    USER_SESSION_KEY
  );

  if (typeof username !== "string" || !(await getUser(username))) {
    return null;
  }

  return username;
}
