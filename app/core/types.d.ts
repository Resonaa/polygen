import type { Server as ServerType, Socket as SocketType } from "socket.io";
import type { Socket as ClientSocketType } from "socket.io-client";

import type { Message } from "~/core/server/message";
import type { MaybeMap } from "~/core/server/game/map";
import type { Pos } from "~/core/server/game/utils";
import type { LandColor, MaybeLand } from "~/core/server/game/land";
import type { TeamId } from "~/core/server/room";

interface ServerToClientEvents {
  message: (message: Message) => void;
  info: (info: string) => void;
  updateTeams: (teams: [TeamId, string[]][]) => void;
  updateReadyPlayers: (readyPlayers: string[]) => void;
  gameStart: ({ maybeMap, myColor }: { maybeMap: MaybeMap, myColor: LandColor }) => void;
  patch: ({ turn, updates }: { turn: number, updates: [Pos, MaybeLand][] }) => void;
  die: () => void;
  win: (winnerStr: string) => void;
}

interface ClientToServerEvents {
  joinRoom: (rid: string) => void;
  message: ({ type, content }: Pick<Message, "type" | "content">) => void;
  joinTeam: (team: number | undefined) => void;
  ready: () => void;
  move: (movement: [Pos, Pos, boolean]) => void;
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