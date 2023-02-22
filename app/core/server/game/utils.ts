import type { RoomMode } from "~/core/server/room";
import type { Map } from "~/core/server/game/map";
import { LandType } from "~/core/server/game/land";

export function getDir(mode: RoomMode, row: number) {
  if (row % 2 === 0) {
    return [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [0, -1]];
  } else {
    return [[-1, -1], [-1, 0], [0, 1], [1, 0], [1, -1], [0, -1]];
  }
}

export function getNeighbours(gm: Map, cur: number[]) {
  return getDir(gm.mode, cur[0])
    .map(([dx, dy]) => [dx + cur[0], dy + cur[1]])
    .filter(([x, y]) => x >= 1 && x <= gm.size && y >= 1 && y <= gm.size);
}

export function playerCountToSize(playerCount: number) {
  return 14 + Math.ceil((playerCount - 2) / 2) * 2;
}

export function astar(map: Map, from: number[], to: number[]) {
  let vis: boolean[][] = [];
  for (let i = 0; i <= map.size; i++) {
    vis.push([]);

    for (let j = 0; j <= map.size; j++) {
      vis[i].push(false);
    }
  }

  let q: [number[], number][] = [[from, 0]];

  vis[from[0]][from[1]] = true;

  while (q.length > 0) {
    let front = q.shift();

    if (!front) {
      return -1;
    }

    const [cur, len] = front;

    for (let nxt of getNeighbours(map, cur)) {
      if (vis[nxt[0]][nxt[1]] || [LandType.Mountain, LandType.City].includes(map.get(nxt[0], nxt[1]).type)) {
        continue;
      }

      vis[nxt[0]][nxt[1]] = true;

      q.push([nxt, len + 1]);

      if (nxt[0] === to[0] && nxt[1] === to[1])
        return len + 1;
    }
  }

  return -1;
}