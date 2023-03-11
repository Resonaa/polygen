import { Player } from "~/core/server/player";
import type { Server } from "~/core/types";

export const SocketRoom = {
  rid: (rid: string) => `#${rid}`,
  username: (username: string) => `@${username}`,
  usernameRid: (username: string, rid: string) => `@${username}#${rid}`
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

export function handlePlayerJoin(server: Server, username: string, rid: string) {
  if (!roomData.has(rid))
    roomData.set(rid, new Room(rid));

  if (roomData.get(rid)?.players.some(player => player.username === username))
    return false;

  roomData.get(rid)?.players.push(new Player(username));

  server.to(SocketRoom.rid(rid)).emit("info", `${username}进入了房间`);

  return true;
}

export function handlePlayerLeave(server: Server, username: string, rid: string) {
  const room = roomData.get(rid);

  if (!room) {
    return;
  }

  const index = room.players.findIndex(player => player.username === username);
  if (index !== -1) {
    room.players.splice(index, 1);

    server.to(SocketRoom.rid(rid)).emit("info", `${username}离开了房间`);

    if (room.players.length === 0 && rid !== "161")
      roomData.delete(rid);
  }
}