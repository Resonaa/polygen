import { Land, LandType } from "~/core/server/game/land";
import { RoomMode } from "~/core/server/room";
import type { Pos } from "~/core/server/game/utils";

export class Map {
  width: number;
  height: number;
  gm: Land[][];
  mode: RoomMode;

  constructor(width: number = 0, height: number = 0, mode: RoomMode = RoomMode.Hexagon) {
    this.width = width;
    this.height = height;
    this.gm = [];
    this.mode = mode;

    for (let i = 0; i <= height; i++) {
      this.gm.push([]);

      for (let j = 0; j <= width; j++) {
        this.gm[i].push(new Land());
      }
    }
  }

  get([i, j]: Pos) {
    return this.gm[i][j];
  }

  check([i, j]: Pos) {
    return i >= 1 && i <= this.height && j >= 1 && j <= this.width;
  }

  accessible(pos: Pos) {
    const land = this.get(pos);
    return land.type !== LandType.Mountain && land.type !== LandType.UnknownMountain;
  }

  dir([_, j]: Pos): [number, number][] {
    if (j % 2 === 1) {
      return [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1]];
    } else {
      return [[0, -1], [-1, 0], [0, 1], [1, 1], [1, 0], [1, -1]];
    }
  }

  neighbours([i, j]: Pos) {
    return this.dir([i, j])
      .map(([dx, dy]) => [dx + i, dy + j] as Pos)
      .filter(pos => this.check(pos));
  }
}