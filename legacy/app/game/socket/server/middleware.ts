import { SESSION_SECRET } from "~/env.server";
import { getUser } from "~/models/user.server";
import { sessionStorage } from "~/session.server";
import { cuid } from "~/utils/cuid";

import type { Server } from "../types";

/**
 * Middleware for authentication.
 */
const middleware: Parameters<Server["use"]>[0] = async (socket, next) => {
  const cookie = socket.request.headers.cookie;

  // Fallback random username.
  socket.data.username = cuid().substring(1);

  // Bypass the check using SESSION_SECRET.
  if (cookie?.startsWith(SESSION_SECRET)) {
    socket.data.username = cookie.substring(SESSION_SECRET.length);
    next();
    return;
  }

  // Get the username from Session.
  const username = (await sessionStorage.getSession(cookie)).get("username");

  // Username should exist in database.
  if (typeof username === "string" && (await getUser(username))) {
    socket.data.username = username;
  }

  next();
};

export default middleware;
