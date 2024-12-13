import type { Server } from "../types";

import auth from "./middleware";
import registerPing from "./ping";

export default (server: Server) => {
  // Authenticate the user before connection.
  server.use(auth);

  server.on("connect", socket => {
    // Discard the initial HTTP request to save memory.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // noinspection JSConstantReassignment
    delete socket.conn.request;

    // Leave the default room.
    socket.leave(socket.id);

    console.log(socket.data.username, "connected");

    registerPing(socket);

    socket.on("disconnect", reason => {
      console.log(socket.data.username, reason);
    });
  });
};
