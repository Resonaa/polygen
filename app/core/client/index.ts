import type { Socket } from "socket.io-client";

export function setClient(client: Socket, rid: string) {
  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  client.on("disconnect", () => {
    window.location.href = "/game";
  });
}