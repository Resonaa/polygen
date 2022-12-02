import type { Server } from "socket.io";

import { identify } from "~/core/server/identification";
import { handlePlayerJoin, handlePlayerLeave, SocketRoom } from "~/core/server/room";

export function setServer(server: Server) {
  server.on("connection", async socket => {
    const username = await identify(socket);

    if (!username) {
      socket.disconnect();
      return;
    }

    server.in(SocketRoom.username(username)).disconnectSockets();
    socket.leave(socket.id);
    handlePlayerLeave(username);

    socket.data.username = username;
    console.log(username, "connected");

    socket.on("joinRoom", rid => {
      socket.data.rid = rid;
      socket.join(SocketRoom.username(username));
      socket.join(SocketRoom.rid(rid));
      handlePlayerJoin(username, rid);
    });

    socket.on("disconnect", () => {
      console.log(username, "disconnected");
      handlePlayerLeave(username);
    });
  });
}