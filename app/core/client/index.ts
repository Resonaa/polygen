import LZString from "lz-string";

import { Renderer } from "~/core/client/renderer";
import { LandType } from "~/core/server/map/land";
import { Map } from "~/core/server/map/map";
import type { Pos } from "~/core/server/map/utils";

import type { ClientSocket, Patch } from "../types";

export function registerClientSocket(
  client: ClientSocket,
  rid: string,
  setShowCanvas: (show: boolean) => void,
  backgroundColor?: number
) {
  client.on("connect", () => {
    client.emit("joinRoom", rid);
  });

  const canvas = document.querySelector("canvas");
  if (!canvas) {
    return;
  }

  const renderer = new Renderer(canvas, backgroundColor);

  let halfTag = false;

  renderer.handleMove = (from, to) => {
    client.emit("move", [from, to, halfTag]);
    halfTag = false;
  };

  renderer.handleSplitArmy = () => (halfTag = !halfTag);

  renderer.handleClearMovements = () => client.emit("clearMovements");

  renderer.handleUndoMovement = () => client.emit("undoMovement");

  renderer.handleSurrender = () => client.emit("surrender");

  let gm: Map;

  client
    .on("gameStart", ({ maybeMap, myColor }) => {
      setShowCanvas(true);
      gm = Map.from(maybeMap);
      renderer.bind(gm, myColor);
    })
    .on("win", () => {
      setShowCanvas(false);
    })
    .on("patch", data => {
      const patch = JSON.parse(LZString.decompressFromUTF16(data)) as Patch;
      for (const [id, maybeLand] of patch.updates) {
        const y = ((id - 1) % gm.width) + 1,
          x = (id - y) / gm.width + 1;
        const pos: Pos = [x, y];
        const land = gm.get(pos);

        if (maybeLand.t !== undefined) {
          land.type = maybeLand.t;
          renderer.updateType(pos);

          if (
            maybeLand.c === undefined &&
            ((land.color === 0 && land.type === LandType.Land) ||
              land.type >= LandType.City)
          ) {
            renderer.updateGraphics(pos);
          }
        }

        if (maybeLand.c !== undefined) {
          land.color = maybeLand.c;
          renderer.updateGraphics(pos);
          renderer.updateHit(pos);
        }

        if (maybeLand.a !== undefined) {
          land.amount += maybeLand.a;
          renderer.updateAmount(pos);
        }
      }
    });
}
