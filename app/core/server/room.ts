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
  teams: Map<number, string[]>;
  private map: RoomMap;
  private ongoing: boolean;

  private gm: GameMap;

  private readyPlayers: Set<string>;

  constructor(id: string) {
    this.id = id;
    this.ongoing = false;
    this.teams = new Map();

    this.map = RoomMap.Random;
    this.gm = new GameMap();

    this.readyPlayers = new Set();
  }

  export() {
    this.simplifyTeams();
    const players = this.exportPlayers();
    return { id: this.id, ongoing: this.ongoing, players, map: this.map, mode: this.gm.mode };
  }

  simplifyTeams() {
    let newTeams: typeof this.teams = new Map();
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

  removePlayer(player: string) {
    for (let [team, players] of this.teams) {
      const index = players.indexOf(player);
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

  addPlayer(player: string, team?: number) {
    this.removePlayer(player);

    if (team === undefined) {
      team = this.getNewTeamId();
    }

    let item = this.teams.get(team);
    if (!item) {
      item = [];
    }

    item.push(player);
    this.teams.set(team, item);

    if (team === 0) {
      return this.readyPlayers.delete(player);
    }
  }

  exportTeams() {
    this.simplifyTeams();
    return Array.from(this.teams.entries());
  }

  toggleReady(player: string) {
    if (!this.readyPlayers.delete(player)) {
      this.readyPlayers.add(player);
    }
  }

  exportReadyPlayers() {
    return Array.from(this.readyPlayers.values());
  }
}

export type RoomData = Map<string, Room>;

declare global {
  var roomData: RoomData;
}

export const roomData = global.roomData ? global.roomData : new Map<string, Room>();

global.roomData = roomData;

export class RoomManager {
  private server: Server;
  rid: string = "";

  constructor(server: Server) {
    this.server = server;
  }

  join(player: string) {
    let room = roomData.get(this.rid);

    if (!room) {
      room = new Room(this.rid);
      roomData.set(this.rid, room);
    }

    if (room.exportPlayers().includes(player)) {
      return false;
    }

    room.addPlayer(player);

    this.server.to(SocketRoom.rid(this.rid)).emit("info", `${player}进入了房间`);
    this.server.to(SocketRoom.rid(this.rid)).emit("updateTeams", room.exportTeams());

    return true;
  }

  leave(player: string) {
    const room = roomData.get(this.rid);

    if (!room) {
      return;
    }

    if (room.removePlayer(player)) {
      this.server.to(SocketRoom.rid(this.rid)).emit("info", `${player}离开了房间`);
      this.server.to(SocketRoom.rid(this.rid)).emit("updateTeams", room.exportTeams());

      if (room.teams.size === 0)
        roomData.delete(this.rid);
    }
  }

  team(player: string, team?: number) {
    const room = roomData.get(this.rid);

    if (!room) {
      return;
    }

    const shouldUpdateReadyPlayers = room.addPlayer(player, team);

    this.server.to(SocketRoom.rid(this.rid)).emit("updateTeams", room.exportTeams());

    if (shouldUpdateReadyPlayers) {
      this.server.to(SocketRoom.rid(this.rid)).emit("updateReadyPlayers", room.exportReadyPlayers());
    }
  }

  ready(player: string) {
    const room = roomData.get(this.rid);

    if (!room) {
      return;
    }

    room.toggleReady(player);

    this.server.to(SocketRoom.rid(this.rid)).emit("updateReadyPlayers", room.exportReadyPlayers());
  }
}