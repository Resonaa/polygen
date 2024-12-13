const LANDS_PER_PLAYER = 100;

/**
 * Gets the default size for a square map containing n players.
 */
export function playersToSize(players: number) {
  return Math.sqrt(players * LANDS_PER_PLAYER) >>> 0;
}

export const MIN_CITY_STRENGTH = 40;
export const MAX_CITY_STRENGTH = 50;

export const MIN_DISTANCE_BETWEEN_CROWNS = 9;
