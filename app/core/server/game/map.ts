import type { LandColor, MaybeLand } from "~/core/server/game/land";
import { Land, LandType } from "~/core/server/game/land";
import type { Pos } from "~/core/server/game/utils";
import type { Room } from "~/core/server/room";

export enum MapMode {
  Hexagon = "六边形",
  Square = "四边形"
}

export interface MaybeMap {
  width: number;
  height: number;
  gm: MaybeLand[][];
  mode: MapMode;
}

export class Map {
  width: number;
  height: number;
  gm: Land[][];
  mode: MapMode;

  constructor(width: number = 0, height: number = 0, mode: MapMode = MapMode.Hexagon) {
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

  dir([, j]: Pos): [number, number][] {
    switch (this.mode) {
      case MapMode.Hexagon: {
        if (j % 2 === 1) {
          return [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1]];
        } else {
          return [[0, -1], [-1, 0], [0, 1], [1, 1], [1, 0], [1, -1]];
        }
      }
      case MapMode.Square: {
        return [[-1, 0], [0, -1], [1, 0], [0, 1]];
      }
    }
  }

  neighbours([i, j]: Pos) {
    return this.dir([i, j])
      .map(([dx, dy]) => [dx + i, dy + j] as Pos)
      .filter(pos => this.check(pos));
  }

  export(): MaybeMap {
    const gm = this.gm.map(row => row.map(land => land.export()));
    return { width: this.width, height: this.height, mode: this.mode, gm };
  }

  static from({ width, height, mode, gm }: MaybeMap) {
    let map = new this(width, height, mode);
    map.gm = gm.map(row => row.map(maybeLand => Land.from(maybeLand)));
    return map;
  }

  ownedByTeam(pos: Pos, myColor: LandColor, teams: Room["gameTeams"]) {
    const land = this.get(pos);
    return teams.get(myColor) === teams.get(land.color);
  }

  visible(pos: Pos, myColor: LandColor, teams: Room["gameTeams"]) {
    switch (this.mode) {
      case MapMode.Hexagon: {
        if (this.ownedByTeam(pos, myColor, teams)) {
          return true;
        }

        for (let neighbour of this.neighbours(pos)) {
          if (this.ownedByTeam(neighbour, myColor, teams)) {
            return true;
          }
        }
        return false;
      }
      case MapMode.Square: {
        for (let i = pos[0] - 1; i <= pos[0] + 1; i++) {
          for (let j = pos[1] - 1; j <= pos[1] + 1; j++) {
            if (this.check([i, j]) && this.ownedByTeam([i, j], myColor, teams)) {
              return true;
            }
          }
        }
        return false;
      }
    }
  }

  mask(myColor: LandColor, teams: Room["gameTeams"]): MaybeMap {
    let ans = this.export();

    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        const pos = [i, j] as Pos;
        if (myColor !== 0 && !this.visible(pos, myColor, teams)) {
          let land = this.get(pos);
          if (land.type === LandType.Mountain) {
            ans.gm[i][j].t = LandType.UnknownMountain;
          } else if (land.type === LandType.City) {
            ans.gm[i][j].t = LandType.UnknownCity;
          } else {
            ans.gm[i][j].t = LandType.Unknown;
          }

          ans.gm[i][j].c = ans.gm[i][j].a = 0;
        }
      }
    }

    return ans;
  }
}