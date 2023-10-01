import { identify } from "~/core/server/identification";
import { MessageType } from "~/core/server/message";
import { RoomManager, SocketRoom } from "~/core/server/room";
import type { Server } from "~/core/types";

export function setServer(server: Server) {
  server.on("connection", async socket => {
    const username = await identify(socket);

    if (!username) {
      socket.disconnect();
      return;
    }

    // @ts-ignore
    // noinspection JSConstantReassignment
    delete socket.conn.request;

    socket.leave(socket.id);

    const rm = new RoomManager(server);

    socket.on("joinRoom", rid => {
      server.in(SocketRoom.usernameRid(username, rid)).disconnectSockets();

      rm.leave(username);

      socket.join(SocketRoom.rid(rid));
      socket.join(SocketRoom.usernameRid(username, rid));
      rm.join(username, rid);
    }).on("message", ({ type, content }) => {
      if (content.trim().length <= 0 || content.length > 616) {
        return;
      }

      if (type === MessageType.World) {
        server.emit("message", { type, content, sender: username });
      } else if (type === MessageType.Room) {
        rm.roomMessage(username, content);
      } else if (type === MessageType.Team) {
        rm.teamMessage(username, content);
      }
    }).on("disconnect", () => rm.leave(username))
          .on("joinTeam", team => rm.team(username, team))
          .on("ready", () => rm.ready(username))
          .on("move", movement => rm.addMovement(username, movement))
          .on("clearMovements", () => rm.clearMovements(username))
          .on("undoMovement", () => rm.undoMovement(username))
          .on("surrender", () => rm.surrender(username))
          .on("vote", ({ item, value }) => rm.vote(item, value, username));
  });
}