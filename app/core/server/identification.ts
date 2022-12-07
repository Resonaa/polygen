import type { ServerSocket } from "~/core/types";
import { sessionStorage, USER_SESSION_KEY } from "~/session.server";

export async function identify(socket: ServerSocket) {
  const cookie = socket.request.headers.cookie;

  if (!cookie)
    return null;

  const username = (await sessionStorage.getSession(cookie)).get(USER_SESSION_KEY);

  if (typeof username !== "string")
    return null;

  return username;
}