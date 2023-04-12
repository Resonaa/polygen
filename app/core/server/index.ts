import { identify } from "~/core/server/identification";
import { RoomManager, SocketRoom } from "~/core/server/room";
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

    const rm = new RoomManager(server);

    socket.on("joinRoom", rid => {
      rm.rid = rid;
      server.in(SocketRoom.usernameRid(username, rid)).disconnectSockets();

      rm.leave(username);

      socket.data.rid = rid;

      socket.join(SocketRoom.rid(rid));
      socket.join(SocketRoom.usernameRid(username, rid));
      rm.join(username);
    });

    socket.on("message", ({ type, content }) => {
      if (content.trim().length <= 0 || content.length > 616)
        return;

      if (type === MessageType.World)
        server.emit("message", { type, content, username });
      else if (type === MessageType.Room && rm.rid)
        server.to(SocketRoom.rid(rm.rid)).emit("message", { type, content, username });
    });

    socket.on("disconnect", () => rm.leave(username));

    socket.on("joinTeam", team => rm.team(username, team));

    socket.on("ready", () => rm.ready(username));

    socket.on("move", movement => rm.addMovement(username, movement));
  });
}