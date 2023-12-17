import { merge } from "../client/settings";

export interface Player {
  username: string;
  color: number;
  team: number;
  ready: boolean;
  gaming: boolean;
}

const defaultPlayer: Player = {
  username: "",
  color: 0,
  team: 0,
  ready: false,
  gaming: false
};

type Select = Partial<Player>;
type Data = Partial<Player>;

function query(player: Player, key: Select) {
  for (const [k, v] of Object.entries(key)) {
    if (player[k as keyof Player] !== v) {
      return false;
    }
  }

  return true;
}

export class Players extends Array<Player> {
  constructor(players?: Player[]) {
    super(...(players ?? []));
  }

  insert(data: Data) {
    const player = merge(defaultPlayer, data);

    this.push(player);

    return player;
  }

  select(key: Select) {
    return this.filter(player => query(player, key));
  }

  selectUnique(key: Select) {
    return this.select(key).at(0);
  }

  update(key: Select, value: Data) {
    const players = this.select(key);

    for (let player of players) {
      player = merge(player, value);
    }

    return players;
  }

  delete(key: Select) {
    const deletion = [];

    for (const [id, player] of this.entries()) {
      if (query(player, key)) {
        deletion.push(player);
        this.splice(id, 1);
      }
    }

    return deletion;
  }
}
