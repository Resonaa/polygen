import Game from "./game";
import Teams from "./team";
import { VoteManager } from "./vote";

const ratedRooms = ["161"];

export default class Room {
  id: string;

  rated: boolean;

  teams = new Teams();

  game = new Game();

  votes = new VoteManager();

  ongoing = false;

  constructor(id: string) {
    this.id = id;
    this.rated = ratedRooms.includes(id);
  }

  export() {
    return {
      teams: this.teams,
      votes: this.votes.ans,
      id: this.id,
      ongoing: this.ongoing,
      rated: this.rated
    };
  }

  toggleReady(username: string) {
    const player = this.teams.selectUnique({ username })!;
    player.ready = !player.ready;
  }
}
