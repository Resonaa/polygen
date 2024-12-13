import { SESSION_SECRET } from "~/env.server";
import { getUser } from "~/models/user.server";
import { sessionStorage } from "~/session.server";

import type { ServerSocket } from "../types";

/**
 * Gets and validates username from an incoming socket.
 */
export async function identify(socket: ServerSocket) {
  const cookie = socket.request.headers.cookie;

  // No cookie provided.
  if (!cookie) {
    return null;
  }

  // Bypass the check using SESSION_SECRET.
  if (cookie.startsWith(SESSION_SECRET)) {
    return cookie.substring(SESSION_SECRET.length);
  }

  // Get the username from Session.
  const username = (await sessionStorage.getSession(cookie)).get("username");

  // Invalid or non-existent username.
  if (typeof username !== "string" || !(await getUser(username))) {
    return null;
  }

  return username;
}
