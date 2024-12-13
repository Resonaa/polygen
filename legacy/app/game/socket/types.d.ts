import type { Server as ServerType, Socket as SocketType } from "socket.io";
import type { Socket as ClientSocketType } from "socket.io-client";
import type { EmptyObject } from "type-fest";

import type { Event as Ping } from "./server/ping";

type ServerToClientEvents = EmptyObject;

interface ClientToServerEvents {
  ping: Ping;
}

interface SocketData {
  username: string;
}

type Server = ServerType<
  ClientToServerEvents,
  ServerToClientEvents,
  never,
  SocketData
>;

type ServerSocket = SocketType<
  ClientToServerEvents,
  ServerToClientEvents,
  never,
  SocketData
>;

type ClientSocket = ClientSocketType<
  ServerToClientEvents,
  ClientToServerEvents
>;
