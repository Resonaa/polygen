import type { RoomMode } from "~/core/server/room";
import { Map } from "~/core/server/game/map";
import { playerCountToSize, astar } from "~/core/server/game/utils";
import { randInt } from "~/core/client/utils";
import { LandType } from "~/core/server/game/land";

const cityDensity = 0.05;
const mountainDensity = 0.13;

function randPos(size: number) {
  return [randInt(1, size), randInt(1, size)];
}

export function generateRandomMap(playerCount: number, mode: RoomMode): Map {
  let map = new Map(playerCountToSize(playerCount), mode);

  const size = map.size, gm = map.gm;

  for (let i = 1; i <= mountainDensity * size * size; i++) {
    while (true) {
      const [x, y] = randPos(size);

      if (gm[x][y].type === LandType.Land) {
        gm[x][y].type = LandType.Mountain;
        break;
      }
    }
  }

  for (let i = 1; i <= cityDensity * size * size; i++) {
    while (true) {
      const [x, y] = randPos(size);

      if (gm[x][y].type === LandType.Land) {
        gm[x][y].type = LandType.City;
        gm[x][y].amount = randInt(41, 50);
        break;
      }
    }
  }

  let generals = [];
  let calcTimes = 0;

  for (let i = 1; i <= playerCount; i++) {
    calcTimes++;
    if (calcTimes >= 100) {
      return generateRandomMap(playerCount, mode);
    }

    let ans = [];

    while (true) {
      const [x, y] = randPos(size);

      if (gm[x][y].type === LandType.Land) {
        ans = [x, y];
        break;
      }
    }

    if (i === 1) {
      gm[ans[0]][ans[1]].color = i;
      gm[ans[0]][ans[1]].amount = 1;
      gm[ans[0]][ans[1]].type = LandType.General;
    } else {
      let tooClose = false;

      for (let last of generals) {
        if (astar(map, ans, last) > 7) {
          continue;
        }

        tooClose = true;
        break;
      }

      if (tooClose) {
        i--;
        continue;
      } else {
        gm[ans[0]][ans[1]].type = LandType.General;
        gm[ans[0]][ans[1]].color = i;
        gm[ans[0]][ans[1]].amount = 1;
      }
    }

    generals.push(ans);
  }

  return map;
}