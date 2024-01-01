import type { CmpAble, Player } from "./player";
import { cmp, Players } from "./player";

/**
 * Extended, ordered player collection with team support.
 *
 * Any operation on Teams must keep it sorted.
 **/
export default class Teams extends Players {
  /**
   * Constructs a new Teams with optional data.
   */
  constructor(players?: readonly Player[]) {
    super(players);
  }

  /**
   * Simplifies team numbers by renumbering from Team 1.
   */
  simplify() {
    const teamMap = new Map<number, number>();

    // Iterate through all players except spectators.
    for (const player of this.filter(({ team }) => team !== 0)) {
      // Try to get the existing new team number.
      const newTeam = teamMap.get(player.team);

      if (newTeam) {
        // Use the pre-assigned value if exists.
        player.team = newTeam;
      } else {
        // Assign a new number for the team.
        const newTeam = teamMap.size + 1;
        teamMap.set(player.team, newTeam);
        player.team = newTeam;
      }
    }
  }

  /**
   * Helper function to get the minimum spare team number.
   */
  private getNewTeamId() {
    return this[this.length - 1].team + 1;
  }

  /**
   * Inserts into Teams while keeping its order.
   */
  insertOrderly(data: CmpAble) {
    let l = 0,
      r = this.length;

    // Use binary search.
    while (l < r) {
      const mid = (l + r) >> 1;

      if (cmp(this[mid], data) > 0) {
        // Player should appear before mid.
        r = mid - 1;
      } else {
        // Player should appear after mid.
        l = mid + 1;
      }
    }

    return this.insert(data, l);
  }

  /**
   * Switches the player to the given team (creates a new team if not provided).
   */
  switch(username: string, team: number = this.getNewTeamId()) {
    this.delete({ username });
    return this.insertOrderly({ username, team });
  }
}
