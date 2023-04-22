import { randInt, shuffle } from "~/core/client/utils";
import { LandType } from "~/core/server/game/land";
import type { MapMode } from "~/core/server/game/map";
import { Map } from "~/core/server/game/map";
import type { Pos } from "~/core/server/game/utils";
import { playerCountToSize, astar } from "~/core/server/game/utils";
import { RoomMap } from "~/core/server/vote";

const cityDensity = 0.05;
const mountainDensity = 0.15;

function generateRandomPos(width: number, height: number) {
  let ans = [];

  for (let i = 1; i <= height; i++) {
    for (let j = 1; j <= width; j++) {
      ans.push([i, j] as Pos);
    }
  }

  shuffle(ans);

  return ans;
}

function generateRandomMap(playerCount: number, mode: MapMode): Map {
  const [width, height] = playerCountToSize(playerCount, mode);
  let map = new Map(width, height, mode);

  const gm = map.gm;

  let randPos = generateRandomPos(width, height);

  for (let i = 1; i <= mountainDensity * width * height; i++) {
    const pos = randPos.shift();

    if (pos) {
      gm[pos[0]][pos[1]].type = LandType.Mountain;
    } else {
      return generateRandomMap(playerCount, mode);
    }
  }

  for (let i = 1; i <= cityDensity * width * height; i++) {
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

function generateEmptyMap(playerCount: number, mode: MapMode): Map {
  const [width, height] = playerCountToSize(playerCount, mode);
  let map = new Map(width, height, mode);

  const gm = map.gm;

  let randPos = generateRandomPos(width, height);

  let generals = [];
  let calcTimes = 0;

  for (let i = 1; i <= playerCount; i++) {
    calcTimes++;
    if (calcTimes >= 100) {
      return generateEmptyMap(playerCount, mode);
    }

    const ans = randPos.shift();

    if (!ans) {
      return generateEmptyMap(playerCount, mode);
    }

    if (i === 1) {
      gm[ans[0]][ans[1]].amount = 1;
      gm[ans[0]][ans[1]].color = i;
      gm[ans[0]][ans[1]].type = LandType.General;
    } else {
      let tooClose = false;

      for (let last of generals) {
        if (astar(map, ans, last) > 5) {
          continue;
        }

        tooClose = true;
        i--;
        break;
      }

      if (tooClose) {
        continue;
      } else {
        gm[ans[0]][ans[1]].amount = 1;
        gm[ans[0]][ans[1]].type = LandType.General;
        gm[ans[0]][ans[1]].color = i;
      }
    }

    generals.push(ans);
  }

  return map;
}

export function generateMap(playerCount: number, mode: MapMode, map: RoomMap) {
  switch (map) {
    case RoomMap.Random: {
      return generateRandomMap(playerCount, mode);
    }
    case RoomMap.Empty: {
      return generateEmptyMap(playerCount, mode);
    }
  }
}