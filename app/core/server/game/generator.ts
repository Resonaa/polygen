import _ from "lodash";

import { LandType } from "~/core/server/game/land";
import type { MapMode } from "~/core/server/game/map";
import { Map } from "~/core/server/game/map";
import type { Pos } from "~/core/server/game/utils";
import { aStar, playerCountToSize } from "~/core/server/game/utils";
import { RoomMap } from "~/core/server/vote";

const cityDensity = 0.05;
const mountainDensity = 0.15;

function generateRandomPos(width: number, height: number) {
  const ans = [];

  for (let i = 1; i <= height; i++) {
    for (let j = 1; j <= width; j++) {
      ans.push([i, j] as Pos);
    }
  }

  return _.shuffle(ans);
}

function generateRandomMap(playerCount: number, mode: MapMode): Map {
  const [width, height] = playerCountToSize(playerCount, mode);
  const map = new Map(width, height, mode);
  const gm = map.gm;

  const randPos = generateRandomPos(width, height);

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
      gm[pos[0]][pos[1]].amount = _.random(41, 50);
    } else {
      return generateRandomMap(playerCount, mode);
    }
  }

  const generals = [];

  for (let i = 1; i <= playerCount; i++) {
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

      for (const last of generals) {
        if (aStar(map, ans, last) > 7 && aStar(map, ans, last, true) !== -1) {
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
  const map = new Map(width, height, mode);
  const gm = map.gm;

  const randPos = generateRandomPos(width, height);

  const generals = [];

  for (let i = 1; i <= playerCount; i++) {
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

      for (const last of generals) {
        if (aStar(map, ans, last) > 5) {
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

function generateMazeMap(playerCount: number, mode: MapMode): Map {
  let [width, height] = playerCountToSize(playerCount, mode);
  if (width % 2 === 0) {
    width++;
  }
  if (height % 2 === 0) {
    height++;
  }

  const map = new Map(width, height, mode);

  const edges = [];
  let vCnt = 0;
  const vNum: number[][] = [];

  for (let i = 0; i <= height; i++) {
    vNum.push([]);
    for (let j = 0; j <= width; j++) {
      vNum[i].push(0);
    }
  }

  for (let i = 1; i <= height; i++) {
    for (let j = 1; j <= width; j++) {
      if (i % 2 === 0 && j % 2 === 0) {
        map.get([i, j]).type = LandType.Mountain;
      } else if (i % 2 === 1 && j % 2 === 1) {
        vNum[i][j] = vCnt;
        vCnt++;
      }
    }
  }

  for (let i = 1; i <= height; i++) {
    for (let j = 1; j <= width; j++) {
      const tmp1 = i - 1,
        tmp3 = j - 1,
        tmp4 = j + 1;
      const tmp2 = i + 1;

      if (
        i % 2 === 0 &&
        j % 2 === 1 &&
        map.check([tmp1, j]) &&
        map.check([tmp2, j])
      ) {
        vNum[i][j] = edges.length;
        edges.push({
          a: vNum[tmp1][j],
          b: vNum[tmp2][j],
          w: 10 + _.random(0, 9),
          pos: [i, j] as Pos
        });
      }
      if (
        i % 2 === 1 &&
        j % 2 === 0 &&
        map.check([i, tmp3]) &&
        map.check([i, tmp4])
      ) {
        vNum[i][j] = edges.length;
        edges.push({
          a: vNum[i][tmp3],
          b: vNum[i][tmp4],
          w: 10 + _.random(0, 9),
          pos: [i, j] as Pos
        });
      }
    }
  }

  const id: number[] = [];
  for (let i = 0; i < vCnt; i++) {
    id.push(i);
  }

  function find(x: number) {
    if (x === id[x]) {
      return x;
    }

    id[x] = find(id[x]);
    return id[x];
  }

  edges.sort((x, y) => x.w - y.w);

  for (const { a, b, pos } of edges) {
    if (find(a) !== find(b)) {
      id[find(a)] = id[b];
      map.get(pos).type = LandType.City;
      map.get(pos).amount = 10;
    } else {
      map.get(pos).type = LandType.Mountain;
    }
  }

  const randPos = generateRandomPos(width, height);
  const generals = [];

  for (let i = 1; i <= playerCount; ) {
    const pos = randPos.shift();
    if (!pos) {
      return generateMazeMap(playerCount, mode);
    }

    if (map.get(pos).type !== LandType.Land) {
      continue;
    }

    let landCnt = 0;
    for (const neighbor of map.neighbors(pos)) {
      if (map.get(neighbor).type !== LandType.Mountain) {
        landCnt++;
      }
    }

    if (landCnt === 1) {
      let tooClose = false;

      for (const last of generals) {
        if (aStar(map, pos, last) >= 8) {
          continue;
        }

        tooClose = true;
        break;
      }

      if (tooClose) {
        continue;
      }

      map.get(pos).color = i;
      map.get(pos).amount = 1;
      map.get(pos).type = LandType.General;
      i++;
      generals.push(pos);
    }
  }

  for (let i = 1; i <= (height * width) / 15; ) {
    const pos = randPos.shift();
    if (!pos) {
      return generateMazeMap(playerCount, mode);
    }

    if (pos[0] % 2 === pos[1] % 2 || map.get(pos).type !== LandType.Mountain) {
      continue;
    }

    let nearHome = false;
    for (const neighbor of map.neighbors(pos)) {
      if (map.get(neighbor).type === LandType.General) {
        nearHome = true;
        break;
      }
    }

    if (!nearHome) {
      map.get(pos).type = LandType.City;
      map.get(pos).amount = 10;
      i++;
    }
  }

  return map;
}

function generatePlotMap(playerCount: number, mode: MapMode): Map {
  const plotSize = 5,
    plotsPerPlayer = 4,
    cityAmount = 161;
  const plotCount = Math.ceil(Math.sqrt(playerCount * plotsPerPlayer));
  const size = plotSize + (plotSize - 1) * (plotCount - 1);

  const map = new Map(size, size, mode);

  let homes = [];

  for (let i = 1; i <= size; i++) {
    for (let j = 1; j <= size; j++) {
      const m1 = i % (plotSize - 1),
        m2 = j % (plotSize - 1);
      const land = map.get([i, j]);
      if (m1 === 1 || m2 === 1) {
        if (
          i !== 1 &&
          i !== size &&
          j !== 1 &&
          j !== size &&
          (m1 === (plotSize + 1) / 2 || m2 === (plotSize + 1) / 2)
        ) {
          land.type = LandType.City;
          land.amount = cityAmount;
        } else {
          land.type = LandType.Mountain;
        }
      } else if ((m1 === 2 && m2 === 2) || (m1 === 0 && m2 === 0)) {
        land.type = LandType.City;
        land.amount = 1;
      } else if (m1 === (plotSize + 1) / 2 && m2 === (plotSize + 1) / 2) {
        homes.push([i, j] as Pos);
      }
    }
  }

  homes = _.shuffle(homes);

  for (let i = 1; i <= playerCount; i++) {
    const pos = homes.shift()!;
    map.get(pos).color = i;
    map.get(pos).type = LandType.General;
    map.get(pos).amount = 1;
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
    case RoomMap.Maze: {
      return generateMazeMap(playerCount, mode);
    }
    case RoomMap.Plot: {
      return generatePlotMap(playerCount, mode);
    }
  }
}
