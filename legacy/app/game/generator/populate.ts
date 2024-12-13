import _ from "lodash";

import type { Gm } from "../gm/gm";
import { Land } from "../gm/land";
import type { Pos } from "../gm/matrix";

import { aStar } from "./aStar";
import { MIN_DISTANCE_BETWEEN_CROWNS } from "./constants";

/**
 * Randomly generates n players on the map.
 */
export function populate(gm: Gm, players: number) {
  const positions = _.shuffle(
    gm.positions().filter(pos => gm.get(pos).type === Land.Type.Land)
  );

  const crowns: Pos[] = [];

  for (let i = 1; i <= players; i++) {
    const ans = positions.shift();

    if (!ans) {
      // Revert all the changes.
      for (const crown of crowns) {
        const land = gm.get(crown);
        land.type = Land.Type.Land;
        land.color = 0;
        land.amount = 0;
      }

      return populate(gm, players);
    }

    const cur = gm.get(ans);

    if (i === 1) {
      cur.color = i;
      cur.amount = 1;
      cur.type = Land.Type.Crown;
    } else {
      let tooClose = false;

      for (const last of crowns) {
        if ((aStar(gm, ans, last) ?? -1) < MIN_DISTANCE_BETWEEN_CROWNS) {
          tooClose = true;
          break;
        }
      }

      if (tooClose) {
        i--;
        continue;
      } else {
        cur.color = i;
        cur.amount = 1;
        cur.type = Land.Type.Crown;
      }
    }

    crowns.push(ans);
  }
}
