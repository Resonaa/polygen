import { identify } from "~/core/server/identification";
import { MessageType } from "~/core/server/message";
import { RoomManager, SocketRoom } from "~/core/server/room";
import type { Server } from "~/core/types";

/**
 * Registers server side logic for Socket.IO Server.
 */
export function setServer(server: Server) {
  // Set up a middleware to identify the incoming connection.
  server.use(async (socket, next) => {
    // Get the username (null if failed).
    const username = await identify(socket);

    if (username) {
      // Save the username in socket data.
      socket.data.username = username;
      next();
    } else {
      // Throw an error to reject the connection.
      next(new Error("User not logged in"));
    }
  });

  // Discard the initial HTTP request to save memory.
  server.engine.on("connection", rawSocket => {
    rawSocket.request = null;
  });

  server.on("connection", socket => {
    const username = socket.data.username;

    if (!username) {
      socket.disconnect();
      return;
    }

    console.log(socket.conn.request);

    socket.leave(socket.id);

    const rm = new RoomManager(server);

    socket
      .on("joinRoom", async rid => {
        server.in(SocketRoom.usernameRid(username, rid)).disconnectSockets();

        await rm.leave(username);

        socket.join(SocketRoom.rid(rid));
        socket.join(SocketRoom.usernameRid(username, rid));
        rm.join(username, rid);
      })
      .on("message", ({ type, content }) => {
        if (content.trim().length <= 0 || content.length > 616) {
          return;
        }

        if (type === MessageType.World) {
          server.emit("message", { type, content, sender: username });
        } else if (type === MessageType.Room) {
          rm.roomMessage(username, content);
        } else {
          rm.teamMessage(username, content);
        }
      })
      .on("disconnect", () => rm.leave(username))
      .on("joinTeam", team => rm.team(username, team))
      .on("ready", () => rm.ready(username))
      .on("move", movement => rm.addMovement(username, movement))
      .on("clearMovements", () => rm.clearMovements(username))
      .on("undoMovement", () => rm.undoMovement(username))
      .on("surrender", () => rm.surrender(username))
      .on("vote", ({ item, value }) => rm.vote(item, value, username));
  });
}
