import { Land } from "~/core/server/game/land";
import { RoomMode } from "~/core/server/room";

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

  get(i: number, j: number) {
    return this.gm[i][j];
  }
}