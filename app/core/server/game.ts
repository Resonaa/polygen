import { Map as GameMap } from "./map/map";
import type { Pos } from "./map/utils";
import Teams from "./team";
import { VoteManager } from "./vote";

export default class Game {
  teams = new Teams();

  gm = new GameMap();

  voteAns = new VoteManager().sample();

  movements = new Map<string, [Pos, Pos, boolean][]>();
}
