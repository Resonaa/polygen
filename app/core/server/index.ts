import type { Server } from "socket.io";

import { identify } from "~/core/server/identification";
import { handlePlayerJoin, handlePlayerLeave, SocketRoom } from "~/core/server/room";
import type { Message } from "~/core/server/message";
import { MessageType } from "~/core/server/message";

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

    let rid: string;

    socket.on("joinRoom", _rid => {
      handlePlayerLeave(username);
      rid = _rid;
      socket.data.rid = rid;
      socket.join(SocketRoom.username(username));
      socket.join(SocketRoom.rid(rid));
      handlePlayerJoin(username, rid);
    });

    socket.on("message", ({ type, content }: Message) => {
      if (content.trim().length <= 0 || content.length > 616)
        return;

      const time = new Date();

      if (type === MessageType.World)
        server.emit("message", { type, content, username, time });
      else if (type === MessageType.Room && rid)
        server.to(SocketRoom.rid(rid)).emit("message", { type, content, username, time });
    });

    socket.on("disconnect", () => {
      console.log(username, "disconnected");
      handlePlayerLeave(username);
    });
  });
}