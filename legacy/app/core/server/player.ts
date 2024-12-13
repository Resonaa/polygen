import { merge } from "~/utils/merge";

/**
 * Interface that describes a player.
 */
export interface Player {
  /**
   * Username of the player.
   */
  username: string;

  /**
   * Color of the player.
   */
  color: number;

  /**
   * Team of the player.
   */
  team: number;

  /**
   * Whether the player is ready.
   */
  ready: boolean;

  /**
   * Whether the player is playing.
   */
  gaming: boolean;
}

/**
 * Default value for creating a new Player.
 */
export const defaultPlayer: Player = {
  username: "",
  color: 0,
  team: 0,
  ready: false,
  gaming: false
};

/**
 * Type for selecting entries from Players.
 */
type Select = Partial<Player>;

/**
 * Type for creating or updating data from Players.
 */
export type Data = Partial<Player>;

/**
 * Tests if the player matches the key.
 */
function query(player: Player, key: Select) {
  for (const [k, v] of Object.entries(key)) {
    // One entry doesn't match, the test fails.
    if (player[k as keyof Player] !== v) {
      return false;
    }
  }

  // Pass if every entry matches.
  return true;
}

/**
 * Helper type for comparing players.
 */
export type CmpAble = Pick<Player, "team" | "username"> & Data;

/**
 * Compares two players.
 *
 * @return A number indicating the order of the given players.
 */
export function cmp(a: CmpAble, b: CmpAble) {
  if (a.team !== b.team) {
    // Team numbers in ascending order.
    return a.team - b.team;
  } else {
    // Usernames in ascending order.
    return a.username.localeCompare(b.username);
  }
}

/**
 * A collection of players.
 */
export class Players extends Array<Player> {
  /**
   * Constructs a new Players with optional data.
   */
  constructor(players?: readonly Player[]) {
    super(...(players ?? []));
  }

  /**
   * Creates and inserts a new player into the given position (defaults to the last index) in Players.
   *
   * @return The created player.
   */
  insert(data: Data, at: number = this.length) {
    // Merge the missing fields.
    const player = merge<Player>(defaultPlayer, data);

    this.splice(at, 0, player);

    return player;
  }

  /**
   * Selects entries from Players.
   *
   * @return Selected entries.
   */
  select(key: Select) {
    return this.filter(player => query(player, key));
  }

  /**
   * Selects only one entry from Players.
   *
   * @return Selected entry, undefined if not found.
   */
  selectUnique(key: Select) {
    return this.select(key).at(0);
  }

  /**
   * Updates entries in Players.
   *
   * @return Updated entries.
   */
  update(key: Select, value: Data) {
    const players = this.select(key);

    for (let player of players) {
      player = merge<Player>(player, value);
    }

    return players;
  }

  /**
   * Deletes entries from Players.
   *
   * @return Deleted entries.
   */
  delete(key: Select) {
    const deletion = [];

    for (const [id, player] of this.entries()) {
      // If matches, remove the entry.
      if (query(player, key)) {
        deletion.push(player);
        this.splice(id, 1);
      }
    }

    return deletion;
  }
}
