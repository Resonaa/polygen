import type { Message } from "~/core/server/message";

import type { Server as ServerType, Socket as SocketType } from "socket.io";
import type { Socket as ClientSocketType } from "socket.io-client";

interface ServerToClientEvents {
  message: (message: Message) => void;
  info: (info: string) => void;
  updateTeams: (teams: [number, string[]][]) => void;
  updateReadyPlayers: (readyPlayers: string[]) => void;
}

interface ClientToServerEvents {
  joinRoom: (rid: string) => void;
  message: ({ type, content }: Pick<Message, "type" | "content">) => void;
  joinTeam: (team: number | undefined) => void;
  ready: () => void;
}

interface InterServerEvents {
}

interface SocketData {
  username: string;
  rid: string;
}

type Server = ServerType<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type ServerSocket = SocketType<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type ClientSocket = ClientSocketType<ServerToClientEvents, ClientToServerEvents>;