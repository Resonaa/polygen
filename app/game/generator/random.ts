import { Gm } from "../gm/gm";

import type { MapConfig } from "./common";
import { playersToSize } from "./constants";
import { construct } from "./construct";
import { populate } from "./populate";

export function generateRandomMap({ players, mode, ...config }: MapConfig) {
  const size = playersToSize(players);
  const width = (size * (config.width + 0.5)) >>> 0;
  const height = (size * (config.height + 0.5)) >>> 0;

  const gm = Gm.empty(mode, height, width);

  construct(gm, 0.44, -0.77);
  populate(gm, players);

  return gm;
}
