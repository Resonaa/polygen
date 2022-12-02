import { Land } from "~/core/server/game/land";

export class Map {
  size: number;
  gm: Land[][];

  constructor(size: number = 0) {
    this.size = size;
    this.gm = [];

    for (let i = 0; i <= size; i++) {
      this.gm.push([]);

      for (let j = 0; j <= size; j++) {
        this.gm[i].push(new Land());
      }
    }
  }
}