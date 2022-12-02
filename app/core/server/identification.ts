import type { Socket } from "socket.io";

import { sessionStorage, USER_SESSION_KEY } from "~/session.server";

export async function identify(socket: Socket) {
  const cookie = socket.request.headers.cookie;

  if (!cookie)
    return null;

  const username = (await sessionStorage.getSession(cookie)).get(USER_SESSION_KEY);

  if (typeof username !== "string")
    return null;

  return username;
}