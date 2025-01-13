import { FaceType, type GM } from "../gm";

/**
 * Calculates the distance between two lands on the map.
 */
export function aStar(gm: GM, from: number, to: number) {
  const vis = new Map<number, boolean>();

  const q: [number, number][] = [[from, 0]];

  vis.set(from, true);

  while (true) {
    const front = q.shift();
    if (!front) {
      break;
    }

    const [cur, len] = front;

    for (const nxt of gm.edges[cur]) {
      if (vis.get(nxt) || gm.faces[nxt].type === FaceType.City) {
        continue;
      }

      vis.set(nxt, true);
      q.push([nxt, len + 1]);

      if (nxt.toString() === to.toString()) {
        return len + 1;
      }
    }
  }

  return null;
}
