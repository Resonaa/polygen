import { Land, LandType } from "~/core/server/game/land";
import { RoomMode } from "~/core/server/room";
import type { Pos } from "~/core/server/game/utils";

export class Map {
  size: number;
  gm: Land[][];
  mode: RoomMode;

  constructor(size: number = 0, mode: RoomMode = RoomMode.Hexagon) {
    this.size = size;
    this.gm = [];
    this.mode = mode;

    for (let i = 0; i <= size; i++) {
      this.gm.push([]);

      for (let j = 0; j <= size; j++) {
        this.gm[i].push(new Land());
      }
    }
  }

  get([i, j]: Pos) {
    return this.gm[i][j];
  }

  check([i, j]: Pos) {
    return i >= 1 && i <= this.size && j >= 1 && j <= this.size;
  }

  accessible(pos: Pos) {
    const land = this.get(pos);
    return land.type !== LandType.Mountain && land.type !== LandType.UnknownMountain;
  }
}