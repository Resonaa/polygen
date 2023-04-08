import type { ClientSocket } from "../types";
import { randInt } from "~/core/client/utils";
import { generateRandomMap } from "~/core/server/game/generator";
import { Renderer } from "~/core/client/renderer";
import { MapMode } from "~/core/server/game/map";

export function registerClientSocket(client: ClientSocket, rid: string) {
  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  const gm = generateRandomMap(randInt(2, 16), MapMode.Hexagon);

  const renderer = new Renderer(canvas);
  renderer.bind(gm);

  renderer.handleMove = () => true;
}