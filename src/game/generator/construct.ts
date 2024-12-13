import _ from "lodash";
import { createNoise2D } from "simplex-noise";

import {
  MAX_CITY_STRENGTH,
  MIN_CITY_STRENGTH
} from "~/game/generator/constants";
import { Land } from "~/game/gm/land";

import type { Gm } from "../gm/gm";

/**
 * Randomly constructs mountains, cities and swamps on an empty map in place.
 */
export function construct(
  gm: Gm,
  mountainThreshold: number,
  cityThreshold: number
) {
  const noise2D = createNoise2D();
  let mountains = 0;
  let cities = 0;

  gm.positions().forEach(pos => {
    const land = gm.get(pos);
    const h = noise2D(pos[0] / 3, pos[1] / 3);

    if (h >= mountainThreshold) {
      land.type = Land.Type.Mountain;
      mountains++;
    } else if (h <= cityThreshold) {
      land.type = Land.Type.City;
      land.amount = _.random(MIN_CITY_STRENGTH, MAX_CITY_STRENGTH);
      cities++;
    }
  });

  console.log("m", mountains / gm.width / gm.height);
  console.log("c", cities / gm.width / gm.height);
}
