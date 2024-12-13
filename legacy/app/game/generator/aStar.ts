import type { Gm } from "../gm/gm";
import { Land } from "../gm/land";
import type { Pos } from "../gm/matrix";
import { Matrix } from "../gm/matrix";

/**
 * Calculates the distance between two lands on the map.
 */
export function aStar(gm: Gm, from: Pos, to: Pos) {
  const vis = Matrix.default(gm.height, gm.width, false);

  const q: [Pos, number][] = [[from, 0]];

  vis.set(from, true);

  while (q.length > 0) {
    const front = q.shift()!;

    const [cur, len] = front;

    for (const nxt of gm.neighbors(cur)) {
      if (
        vis.get(nxt) ||
        !gm.get(nxt).accessible() ||
        gm.get(nxt).type === Land.Type.City
      ) {
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
