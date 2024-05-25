import { Gm } from "../gm/gm";

import { generateRandomMap } from "./random";

/**
 * Currently-supported native maps.
 */
export enum NativeMapVariant {
  Random = "random"
}

/**
 * Map config used by generators.
 */
export interface MapConfig {
  /**
   * `@` for native maps, the others being the usernames of custom map creators.
   */
  namespace: string;

  /**
   * Title of the map.
   */
  title: string;

  /**
   * How many players are there in the map.
   */
  players: number;

  /**
   * Map mode.
   */
  mode: keyof typeof Gm.Mode;

  /**
   * A 0-1 integer determining the width of the map.
   */
  width: number;

  /**
   * A 0-1 integer determining the height of the map.
   */
  height: number;
}

export function generateMap(config: MapConfig) {
  if (config.namespace !== "@") {
    // Unimplemented.
    return new Gm(config.mode, []);
  }

  switch (config.title) {
    case NativeMapVariant.Random: {
      return generateRandomMap(config);
    }
  }

  return new Gm(config.mode, []);
}
