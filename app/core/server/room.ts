import { Player } from "~/core/server/player";
import type { Server } from "~/core/types";
import { Map as GameMap } from "~/core/server/game/map";

export const SocketRoom = {
  rid: (rid: string) => `#${rid}`,
  usernameRid: (username: string, rid: string) => `@${username}#${rid}`
};

export const enum RoomMap {
  Random = "随机地图"
}

export class Room {
  id: string;
  teams: Map<number, Player[]>;
  private map: RoomMap;
  private ongoing: boolean;

  private gm: GameMap;

  constructor(id: string) {
    this.id = id;
    this.ongoing = false;
    this.teams = new Map();

    this.map = RoomMap.Random;
    this.gm = new GameMap();
  }

  export() {
    this.simplifyTeams();
    const players = this.exportPlayers();
    return { id: this.id, ongoing: this.ongoing, players, map: this.map, mode: this.gm.mode };
  }

  simplifyTeams() {
    let newTeams = new Map<number, Player[]>();
    let teamCnt = 1;

    for (let [team, players] of this.teams) {
      if (team === 0) {
        newTeams.set(team, players);
      } else {
        newTeams.set(teamCnt, players);
        teamCnt++;
      }
    }

    this.teams = newTeams;
  }

  exportPlayers() {
    return Array.from(this.teams.values()).flat();
  }

  getNewTeamId() {
    this.simplifyTeams();

    for (let i = 1; ; i++) {
      if (!this.teams.has(i)) {
        return i;
      }
    }
  }

  removePlayer(username: string) {
    for (let [team, players] of this.teams) {
      const index = players.findIndex(player => player.username === username);

      if (index !== -1) {
        players.splice(index, 1);
        if (players.length === 0) {
          this.teams.delete(team);
        }
        return true;
      }
    }

    return false;
  }

  addPlayer(player: Player, team?: number) {
    this.removePlayer(player.username);

    if (team === undefined) {
      team = this.getNewTeamId();
    }

    let item = this.teams.get(team);
    if (!item) {
      item = [];
    }

    item.push(player);
    this.teams.set(team, item);
  }

  exportTeams() {
    this.simplifyTeams();
    return Array.from(this.teams.entries());
  }
}

export type RoomData = Map<string, Room>;

declare global {
  var roomData: RoomData;
}

export const roomData = global.roomData ? global.roomData : new Map<string, Room>();

global.roomData = roomData;

export function handlePlayerJoin(server: Server, username: string, rid: string) {
  let room = roomData.get(rid);

  if (!room) {
    room = new Room(rid);
    roomData.set(rid, room);
  }

  if (room.exportPlayers().some(player => player.username === username)) {
    return false;
  }

  room.addPlayer(new Player(username));

  server.to(SocketRoom.rid(rid)).emit("info", `${username}进入了房间`);
  server.to(SocketRoom.rid(rid)).emit("updateTeams", room.exportTeams());

  return true;
}

export function handlePlayerLeave(server: Server, username: string, rid: string) {
  const room = roomData.get(rid);

  if (!room) {
    return;
  }

  if (room.removePlayer(username)) {
    server.to(SocketRoom.rid(rid)).emit("info", `${username}离开了房间`);
    server.to(SocketRoom.rid(rid)).emit("updateTeams", room.exportTeams());

    if (room.teams.size === 0)
      roomData.delete(rid);
  }
}

export function handlePlayerJoinTeam(server: Server, username: string, rid: string, team?: number) {
  const room = roomData.get(rid);

  if (!room) {
    return;
  }

  room.addPlayer(new Player(username), team);

  server.to(SocketRoom.rid(rid)).emit("updateTeams", room.exportTeams());
}