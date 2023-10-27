import type { ServerSocket } from "~/core/types";
import { SESSION_SECRET } from "~/env.server";
import { getUser } from "~/models/user.server";
import { sessionStorage, USER_SESSION_KEY } from "~/session.server";

export async function identify(socket: ServerSocket) {
  const cookie = socket.request.headers.cookie;

  if (!cookie) {
    return null;
  }

  if (cookie.startsWith(SESSION_SECRET)) {
    return cookie.substring(SESSION_SECRET.length);
  }

  const username = (await sessionStorage.getSession(cookie)).get(
    USER_SESSION_KEY
  );

  if (typeof username !== "string" || !(await getUser(username))) {
    return null;
  }

  return username;
}
