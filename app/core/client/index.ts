import type { ClientSocket } from "../types";
import { Renderer } from "~/core/client/renderer";
import { Map } from "~/core/server/game/map";
import { Land } from "~/core/server/game/land";

export function registerClientSocket(client: ClientSocket, rid: string, setShowCanvas: (show: boolean) => void) {
  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  const renderer = new Renderer(canvas);

  let halfTag = false;

  renderer.handleMove = (from, to) => {
    client?.emit("move", [from, to, halfTag]);
    halfTag = false;
  };

  renderer.handleSplitArmy = () => halfTag = !halfTag;

  renderer.handleClearMovements = () => client?.emit("clearMovements");

  renderer.handleSurrender = () => client?.emit("surrender");

  let gm: Map;

  client.on("gameStart", ({ maybeMap, myColor }) => {
    setShowCanvas(true);
    gm = Map.from(maybeMap);
    renderer.bind(gm, myColor);
  }).on("win", () => {
    setShowCanvas(false);
  }).on("patch", ({ updates }) => {
    for (let [pos, maybeLand] of updates) {
      gm.set(pos, Land.from(maybeLand));
      renderer.update(pos);
    }
  });
}