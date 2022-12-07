import { Player } from "~/core/server/player";

export const SocketRoom = {
  rid: (rid: string) => `#${rid}`,
  username: (username: string) => `@${username}`
};

export const enum RoomMode {
  Hexagon = "六边形"
}

export const enum RoomMap {
  Random = "随机地图"
}

export class Room {
  id: string;
  players: Player[];
  mode: RoomMode;
  map: RoomMap;
  ongoing: boolean;

  constructor(id: string, mode: RoomMode = RoomMode.Hexagon, map: RoomMap = RoomMap.Random) {
    this.id = id;
    this.mode = mode;
    this.map = map;
    this.ongoing = false;
    this.players = [];
  }
}

export type RoomData = Map<string, Room>;

function initializeRoomData() {
  return new Map([["161", new Room("161")]]);
}

declare global {
  var roomData: RoomData;
}

export const roomData = global.roomData ? global.roomData : initializeRoomData();

global.roomData = roomData;

export function handlePlayerJoin(username: string, rid: string) {
  if (!roomData.has(rid))
    roomData.set(rid, new Room(rid));

  if (roomData.get(rid)?.players.some(player => player.username === username))
    return false;

  roomData.get(rid)?.players.push(new Player(username));

  return true;
}

export function handlePlayerLeave(username: string) {
  for (const { id, players } of roomData.values()) {
    const index = players.findIndex(player => player.username === username);

    if (index !== -1) {
      players.splice(index, 1);

      if (players.length === 0 && id !== "161")
        roomData.delete(id);
    }
  }
}