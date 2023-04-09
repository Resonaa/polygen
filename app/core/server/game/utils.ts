import type { Map } from "~/core/server/game/map";
import { LandType } from "~/core/server/game/land";

export type Pos = [number, number];

export function getMinReadyPlayerCount(playerCount: number) {
  if (playerCount === 0) {
    return 0;
  } else {
    return Math.floor((playerCount + 2) / 2);
  }
}

export function playerCountToSize(playerCount: number) {
  const piles = 80 * playerCount;
  const r = 1.2;
  return [Math.floor(Math.sqrt(piles / r) * r), Math.floor(Math.sqrt(piles / r))];
}

export function astar(map: Map, from: Pos, to: Pos) {
  let vis: boolean[][] = [];
  for (let i = 0; i <= map.height; i++) {
    vis.push([]);

    for (let j = 0; j <= map.width; j++) {
      vis[i].push(false);
    }
  }

  let q: [Pos, number][] = [[from, 0]];

  vis[from[0]][from[1]] = true;

  while (q.length > 0) {
    let front = q.shift();

    if (!front) {
      return -1;
    }

    const [cur, len] = front;

    for (let nxt of map.neighbours(cur)) {
      if (vis[nxt[0]][nxt[1]] || [LandType.Mountain, LandType.City].includes(map.get(nxt).type)) {
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