import { identify } from "~/core/server/identification";
import { handlePlayerJoin, handlePlayerLeave, SocketRoom } from "~/core/server/room";
import { MessageType } from "~/core/server/message";
import type { Server } from "~/core/types";

export function setServer(server: Server) {
  server.on("connection", async socket => {
    const username = await identify(socket);

    if (!username) {
      socket.disconnect();
      return;
    }

    socket.leave(socket.id);

    socket.data.username = username;

    let rid: string;

    socket.on("joinRoom", _rid => {
      server.in(SocketRoom.usernameRid(username, _rid)).disconnectSockets();
      handlePlayerLeave(server, username, _rid);

      rid = _rid;
      socket.data.rid = rid;

      socket.join(SocketRoom.username(username));
      socket.join(SocketRoom.rid(rid));
      socket.join(SocketRoom.usernameRid(username, rid));
      handlePlayerJoin(server, username, rid);
    });

    socket.on("message", ({ type, content }) => {
      if (content.trim().length <= 0 || content.length > 616)
        return;

      if (type === MessageType.World)
        server.emit("message", { type, content, username });
      else if (type === MessageType.Room && rid)
        server.to(SocketRoom.rid(rid)).emit("message", { type, content, username });
    });

    socket.on("disconnect", () => {
      handlePlayerLeave(server, username, rid);
    });
  });
}