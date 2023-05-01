import { randInt, shuffle } from "~/core/client/utils";
import { LandType } from "~/core/server/game/land";
import type { MapMode } from "~/core/server/game/map";
import { Map } from "~/core/server/game/map";
import type { Pos } from "~/core/server/game/utils";
import { astar, playerCountToSize } from "~/core/server/game/utils";
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

function generateMazeMap(playerCount: number, mode: MapMode): Map {
  let [width, height] = playerCountToSize(playerCount, mode);
  if (width % 2 === 0) {
    width++;
  }
  if (height % 2 === 0) {
    height++;
  }

  let map = new Map(width, height, mode);

  let edges = [];
  let vCnt = 0;
  let vNum: number[][] = [];

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
      let tmp1 = i - 1, tmp3 = j - 1, tmp4 = j + 1;
      let tmp2 = i + 1;

      if (i % 2 === 0 && j % 2 === 1 && map.check([tmp1, j]) && map.check([tmp2, j])) {
        vNum[i][j] = edges.length;
        edges.push({ a: vNum[tmp1][j], b: vNum[tmp2][j], w: 10 + randInt(0, 9), pos: [i, j] as Pos });
      }
      if (i % 2 === 1 && j % 2 === 0 && map.check([i, tmp3]) && map.check([i, tmp4])) {
        vNum[i][j] = edges.length;
        edges.push({ a: vNum[i][tmp3], b: vNum[i][tmp4], w: 10 + randInt(0, 9), pos: [i, j] as Pos });
      }
    }
  }

  let id: number[] = [];
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

  for (let {a, b, pos} of edges) {
    if (find(a) !== find(b)) {
      id[find(a)] = id[b];
      map.get(pos).type = LandType.City;
      map.get(pos).amount = 10;
    } else {
      map.get(pos).type = LandType.Mountain;
    }
  }

  let randPos = generateRandomPos(width, height);
  for (let i = 1; i <= playerCount;) {
    const pos = randPos.shift();
    if (!pos) {
      return generateMazeMap(playerCount, mode);
    }

    if (map.get(pos).type !== LandType.Land) {
      continue;
    }

    let landCnt = 0;
    for (let neighbour of map.neighbours(pos)) {
      if (map.get(neighbour).type !== LandType.Mountain) {
        landCnt++;
      }
    }

    if (landCnt === 1) {
      map.get(pos).color = i;
      map.get(pos).amount = 1;
      map.get(pos).type = LandType.General;
      i++;
    }
  }

  for (let i = 1; i <= (height * width) / 15;) {
    const pos = randPos.shift();
    if (!pos) {
      return generateMazeMap(playerCount, mode);
    }

    if (pos[0] % 2 === pos[1] % 2 || map.get(pos).type !== LandType.Mountain) {
      continue;
    }

    let nearHome = false;
    for (let neighbour of map.neighbours(pos)) {
      if (map.get(neighbour).type === LandType.General) {
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
  }
}