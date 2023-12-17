import type { Player } from "./player";
import { Players } from "./player";

export default class Teams extends Players {
  constructor(players?: Player[]) {
    super(players);
  }

  simplify() {
    const teamMap = new Map<number, number>();

    for (const player of this.filter(({ team }) => team !== 0)) {
      if (teamMap.has(player.team)) {
        player.team = teamMap.get(player.team)!;
      } else {
        const newTeam = teamMap.size + 1;
        teamMap.set(player.team, newTeam);
        player.team = newTeam;
      }
    }
  }

  private getNewTeamId() {
    return Math.max(...this.map(({ team }) => team)) + 1;
  }

  removePlayer(username: string) {
    this.delete({ username });
    this.simplify();
  }

  addPlayer(username: string, team: number = this.getNewTeamId()) {
    this.removePlayer(username);
    return this.insert({ username, team });
  }
}
