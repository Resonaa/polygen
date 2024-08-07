import { Map } from "../map";

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
  mode: keyof typeof Map.Mode;
}

export function generateMap(config: MapConfig) {
  if (config.namespace !== "@") {
    // Unimplemented.
    return new Map(config.mode, []);
  }

  switch (config.title) {
    case NativeMapVariant.Random: {
      return generateRandomMap(config);
    }
  }

  return new Map(config.mode, []);
}
