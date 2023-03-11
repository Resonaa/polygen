import type { RoomMode } from "~/core/server/room";
import { Map } from "~/core/server/game/map";
import type { Pos } from "~/core/server/game/utils";
import { playerCountToSize, astar } from "~/core/server/game/utils";
import { randInt, shuffle } from "~/core/client/utils";
import { LandType } from "~/core/server/game/land";

const cityDensity = 0.05;
const mountainDensity = 0.13;

function generateRandomPos(size: number) {
  let ans = [];

  for (let i = 1; i <= size; i++) {
    for (let j = 1; j <= size; j++) {
      ans.push([i, j] as Pos);
    }
  }

  shuffle(ans);

  return ans;
}

export function generateRandomMap(playerCount: number, mode: RoomMode): Map {
  let map = new Map(playerCountToSize(playerCount), mode);

  const size = map.size, gm = map.gm;

  let randPos = generateRandomPos(size);

  for (let i = 1; i <= mountainDensity * size * size; i++) {
    const pos = randPos.shift();

    if (pos) {
      gm[pos[0]][pos[1]].type = LandType.Mountain;
    } else {
      return generateRandomMap(playerCount, mode);
    }
  }

  for (let i = 1; i <= cityDensity * size * size; i++) {
    const pos = randPos.shift();

    if (pos) {
      gm[pos[0]][pos[1]].type = LandType.City;
      gm[pos[0]][pos[1]].amount = randInt(41, 50);
    } else {
      return generateRandomMap(playerCount, mode);
    }
  }

  let generals = [];
  let calcTimes = 0;

  for (let i = 1; i <= playerCount; i++) {
    calcTimes++;
    if (calcTimes >= 100) {
      return generateRandomMap(playerCount, mode);
    }

    const ans = randPos.shift();

    if (!ans) {
      return generateRandomMap(playerCount, mode);
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