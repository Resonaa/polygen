import type { ClientSocket } from "../types";
import { randInt } from "~/core/client/utils";
import { generateRandomMap } from "~/core/server/game/generator";
import { RoomMode } from "~/core/server/room";
import { Renderer } from "~/core/client/renderer";

export function registerClientSocket(client: ClientSocket, rid: string) {
  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  const gm = generateRandomMap(randInt(2, 16), RoomMode.Hexagon);

  const renderer = new Renderer(canvas);
  renderer.bind(gm);
}