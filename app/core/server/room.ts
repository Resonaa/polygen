import { shuffle } from "~/core/client/utils";
import { generateMap } from "~/core/server/game/generator";
import type { LandColor, MaybeLand } from "~/core/server/game/land";
import { LandType } from "~/core/server/game/land";
import type { MaybeMap } from "~/core/server/game/map";
import { Map as GameMap } from "~/core/server/game/map";
import type { Pos } from "~/core/server/game/utils";
import { getMinReadyPlayerCount } from "~/core/server/game/utils";
import { MessageType } from "~/core/server/message";
import type { MaxVotedItems, VoteData , VoteItem, VoteValue } from "~/core/server/vote";
import { clearAllVotesOfPlayer, getMaxVotedItem, vote } from "~/core/server/vote";
import type { Server } from "~/core/types";

export const SocketRoom = {
  rid: (rid: string) => `#${rid}`,
  usernameRid: (username: string, rid: string) => `@${username}#${rid}`
};

export type TeamId = number;

export class Room {
  id: string;

  gm: GameMap = new GameMap();

  voteData: VoteData = {};
  voteAns: MaxVotedItems = getMaxVotedItem(this.voteData);

  teams: Map<TeamId, string[]> = new Map();
  readyPlayers: Set<string> = new Set();

  ongoing: boolean = false;

  colors: Map<LandColor, string> = new Map();
  teamsInGame: Map<TeamId, string[]> = new Map();
  gameTeams: Map<LandColor, TeamId> = new Map();
  gamingPlayers: Set<string> = new Set();
  gameInterval: NodeJS.Timer | undefined;
  movements: Map<string, [Pos, Pos, boolean][]> = new Map();
  turn: number = 0;
  surrenders: Set<string> = new Set();

  constructor(id: string) {
    this.id = id;
  }

  export() {
    this.simplifyTeams();
    const players = this.exportPlayers();
    const map = this.voteAns.map;
    const mode = this.voteAns.mode;
    return { id: this.id, ongoing: this.ongoing, players, map, mode };
  }

  simplifyTeams() {
    if (this.ongoing) {
      return;
    }

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
    this.gamingPlayers.delete(player);

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
      team = this.ongoing ? this.playerToTeam(player, this.teamsInGame) : this.getNewTeamId();
    }

    let item = this.teams.get(team);
    if (item) {
      item.push(player);
    } else {
      this.teams.set(team, [player]);
    }

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

  gameStart() {
    this.gameTeams.clear();
    this.gamingPlayers.clear();

    let players: string[] = [];
    for (let [teamId, playersInTeam] of this.teams) {
      if (teamId === 0) {
        continue;
      }

      for (let player of playersInTeam) {
        this.gamingPlayers.add(player);
      }

      players.push(...playersInTeam);
    }

    this.ongoing = true;

    this.gm = generateMap(this.gamingPlayers.size, this.voteAns.mode, this.voteAns.map);

    shuffle(players);

    this.colors = new Map(Array.from(players.entries()).map(([color, player]) => [color + 1, player]));
    this.gameTeams.clear();
    for (let [color, player] of this.colors) {
      this.gameTeams.set(color, this.playerToTeam(player));
    }

    this.teamsInGame = new Map(JSON.parse(JSON.stringify(Array.from(this.teams.entries()))));
  }

  playerToColor(player: string, colors: Room["colors"] = this.colors) {
    for (let [color, username] of colors) {
      if (username === player) {
        return color;
      }
    }

    return 0;
  }

  maskAll() {
    return Array.from(this.colors.keys()).map(color => this.gm.mask(color, this.gameTeams));
  }

  winCheck() {
    let winner = undefined;

    for (let player of this.gamingPlayers) {
      const color = this.playerToColor(player);
      const team = this.gameTeams.get(color) as TeamId;

      if (winner === undefined) {
        winner = team;
      } else if (winner !== team) {
        return undefined;
      }
    }

    return winner;
  }

  playerToTeam(player: string, teams: Room["teams"] = this.teams) {
    const res = Array.from(teams.entries()).find(([, players]) => players.includes(player));
    return res ? res[0] : 0;
  }

  gameEnd() {
    this.ongoing = false;
    this.readyPlayers.clear();
    this.gamingPlayers.clear();
    this.colors.clear();
    this.gameTeams.clear();
    this.movements.clear();
    this.surrenders.clear();
    this.turn = 0;

    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }

    this.gameInterval = undefined;
  }

  checkMovement([from, to, halfTag]: [Pos, Pos, boolean], color: LandColor) {
    if (!this.gm.check(from) || !this.gm.check(to) || !this.gm.accessible(to)) {
      return false;
    }

    const fromLand = this.gm.get(from);
    return !(fromLand.color !== color || fromLand.amount < 2);
  }

  handleMove([from, to, halfTag]: [Pos, Pos, boolean]) {
    const fromLand = this.gm.get(from), toLand = this.gm.get(to);
    const moved = halfTag ? Math.floor((fromLand.amount - 1) / 2) : fromLand.amount - 1;

    if (this.gameTeams.get(fromLand.color) === this.gameTeams.get(toLand.color)) {
      fromLand.amount -= moved;
      toLand.amount += moved;

      if (fromLand.color !== toLand.color && toLand.type !== LandType.General) {
        toLand.color = fromLand.color;
      }
    } else {
      fromLand.amount -= moved;
      toLand.amount -= moved;

      if (toLand.amount < 0) {
        const toColor = toLand.color;
        toLand.amount *= -1;
        toLand.color = fromLand.color;

        if (toLand.type === LandType.General) {
          toLand.type = LandType.City;

          for (let i = 1; i <= this.gm.height; i++) {
            for (let j = 1; j <= this.gm.width; j++) {
              const land = this.gm.get([i, j]);
              if (land.color === toColor) {
                land.color = fromLand.color;
                land.amount = Math.ceil(land.amount / 2);
              }
            }
          }

          return toColor;
        }
      }
    }
  }

  moveAll() {
    let deaths: string[] = [];

    for (let [color, player] of this.colors) {
      if (deaths.includes(player)) {
        continue;
      }

      const movements = this.movements.get(player);
      if (!movements) {
        continue;
      }

      while (movements.length > 0 && !this.checkMovement(movements[0], color)) {
        movements.shift();
      }

      const movement = movements.shift();
      if (!movement) {
        continue;
      }

      const deadPlayer = this.handleMove(movement);
      if (deadPlayer) {
        const username = this.colors.get(deadPlayer);
        if (!username) {
          continue;
        }
        deaths.push(username);
      }
    }

    return deaths;
  }

  addArmy() {
    for (let i = 1; i <= this.gm.height; i++) {
      for (let j = 1; j <= this.gm.width; j++) {
        const land = this.gm.get([i, j]);
        if (land.color === 0) {
          continue;
        }

        if (land.type === LandType.City || land.type === LandType.General) {
          land.amount++;
        } else if (land.type === LandType.Land && this.turn % 15 === 0) {
          land.amount++;
        }
      }
    }
  }

  patchAll(preMap: MaybeMap, preColors: Room["colors"]) {
    let res: Map<string, [Pos, Partial<MaybeLand>][]> = new Map(), preGm = GameMap.from(preMap);
    for (let player of this.exportPlayers()) {
      const preColor = this.playerToColor(player, preColors), nowColor = this.playerToColor(player);
      const pre = preGm.mask(preColor, this.gameTeams);
      const now = this.gm.mask(nowColor, this.gameTeams);

      let patch: [Pos, Partial<MaybeLand>][] = [];

      for (let i = 1; i <= this.gm.height; i++) {
        for (let j = 1; j <= this.gm.width; j++) {
          const preLand = pre.gm[i][j], nowLand = now.gm[i][j];
          let partial: Partial<MaybeLand> = {};

          if (preLand.c !== nowLand.c) {
            partial.c = nowLand.c;
          }

          if (preLand.t !== nowLand.t) {
            partial.t = nowLand.t;
          }

          if (preLand.a !== nowLand.a) {
            partial.a = nowLand.a;
          }

          if (partial.a !== undefined || partial.c !== undefined || partial.t !== undefined) {
            patch.push([[i, j] as Pos, partial]);
          }
        }
      }

      res.set(player, patch);
    }

    return res;
  }

  rankAll() {
    let ans: [LandColor, string, number, number][] = [], data: Map<LandColor, [number, number]> = new Map();

    for (let i = 1; i <= this.gm.height; i++) {
      for (let j = 1; j <= this.gm.width; j++) {
        const land = this.gm.get([i, j]);
        if (land.color === 0 || !this.colors.has(land.color) || !this.gamingPlayers.has(this.colors.get(land.color) as string)) {
          continue;
        }

        const datum = data.get(land.color);
        if (!datum) {
          data.set(land.color, [1, land.amount]);
        } else {
          data.set(land.color, [datum[0] + 1, datum[1] + land.amount]);
        }
      }
    }

    let teamData: Map<TeamId, [number, number]> = new Map();

    for (let [color, [land, army]] of data) {
      ans.push([color, this.colors.get(color) as string, land, army]);

      const team = this.gameTeams.get(color) as number;
      const datum = teamData.get(team);
      if (!datum) {
        teamData.set(team, [land, army]);
      } else {
        teamData.set(team, [land + datum[0], army + datum[1]]);
      }
    }

    ans.sort((a, b) => {
      const teamA = this.gameTeams.get(a[0]) as TeamId, teamB = this.gameTeams.get(b[0]) as TeamId;
      if (teamA !== teamB) {
        const dataA = teamData.get(teamA) as [number, number], dataB = teamData.get(teamB) as [number, number];
        return dataA[1] !== dataB[1] ? dataB[1] - dataA[1] : dataB[0] - dataA[0];
      } else {
        const dataA = data.get(a[0]) as [number, number], dataB = data.get(b[0]) as [number, number];
        return dataA[1] !== dataB[1] ? dataB[1] - dataA[1] : dataB[0] - dataA[0];
      }
    });

    if (Array.from(this.teamsInGame.entries()).some(([teamId, players]) => teamId !== 0 && players.length > 1)) {
      let lastTeam = 0;
      for (let i = 0; i < ans.length; i++) {
        const color = ans[i][0];
        const team = this.gameTeams.get(color) as TeamId;
        if (team !== lastTeam) {
          lastTeam = team;
          const [land, army] = teamData.get(team) as [number, number];
          ans.splice(i, 0, [-1, `Team ${team}`, land, army]);
        }
      }
    }

    return ans;
  }

  removeVotesOf(player: string) {
    const updated = clearAllVotesOfPlayer(this.voteData, player);
    this.voteAns = getMaxVotedItem(this.voteData);
    return updated;
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
    if (room.ongoing && !room.gamingPlayers.has(player) && room.playerToColor(player) !== 0) {
      room.gamingPlayers.add(player);
    }

    this.server.to(SocketRoom.rid(this.rid)).emit("info", `${player}进入了房间`);
    this.server.to(SocketRoom.rid(this.rid)).emit("updateTeams", room.exportTeams());
    this.server.to(SocketRoom.rid(this.rid)).emit("updateReadyPlayers", room.exportReadyPlayers());

    if (room.ongoing) {
      if (room.gamingPlayers.has(player)) {
        const color = room.playerToColor(player);
        this.server.to(SocketRoom.usernameRid(player, this.rid)).emit("gameStart", {
          maybeMap: room.gm.mask(color, room.gameTeams),
          myColor: color
        });
      } else {
        this.server.to(SocketRoom.usernameRid(player, this.rid)).emit("gameStart", {
          maybeMap: room.gm.export(),
          myColor: -1
        });
      }
    }

    return true;
  }

  leave(player: string) {
    const room = roomData.get(this.rid);

    if (!room) {
      return;
    }

    if (room.removePlayer(player)) {
      room.readyPlayers.delete(player);
      const shouldUpdateVotes = room.removeVotesOf(player);

      this.server.to(SocketRoom.rid(this.rid)).emit("info", `${player}离开了房间`);
      this.server.to(SocketRoom.rid(this.rid)).emit("updateTeams", room.exportTeams());
      this.server.to(SocketRoom.rid(this.rid)).emit("updateReadyPlayers", room.exportReadyPlayers());
      shouldUpdateVotes && this.server.to(SocketRoom.rid(this.rid)).emit("updateVotes", {
        data: room.voteData,
        ans: room.voteAns
      });

      if (room.teams.size === 0) {
        roomData.delete(this.rid);

        if (room.ongoing) {
          room.gameEnd();
        }
      }
    }

    this.checkStart();
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

    if (team === 0) {
      const shouldUpdateVotes = room.removeVotesOf(player);
      shouldUpdateVotes && this.server.to(SocketRoom.rid(this.rid)).emit("updateVotes", {
        data: room.voteData,
        ans: room.voteAns
      });
    }

    this.checkStart();
  }

  ready(player: string) {
    const room = roomData.get(this.rid);

    if (!room) {
      return;
    }

    room.toggleReady(player);

    this.server.to(SocketRoom.rid(this.rid)).emit("updateReadyPlayers", room.exportReadyPlayers());

    this.checkStart();
  }

  checkStart() {
    const room = roomData.get(this.rid);

    if (!room || room.ongoing) {
      return;
    }

    const allPlayers = Array.from(room.teams.entries())
      .filter(([teamId,]) => teamId !== 0)
      .map(([, players]) => players)
      .flat(), readyPlayers = room.exportReadyPlayers();

    if (allPlayers.length >= 2 && readyPlayers.length >= getMinReadyPlayerCount(allPlayers.length)) {
      const teamCount = room.exportTeams()
        .filter(([teamId, players]) => teamId !== 0 && players.length > 0)
        .length;
      if (teamCount < 2) {
        return;
      }

      room.gameStart();
      const masks = room.maskAll();

      for (let [color, player] of room.colors) {
        this.server.to(SocketRoom.usernameRid(player, this.rid)).emit("gameStart", {
          maybeMap: masks[color - 1],
          myColor: color
        });
      }

      for (let player of room.exportPlayers()) {
        if (!room.gamingPlayers.has(player)) {
          this.server.to(SocketRoom.usernameRid(player, this.rid)).emit("gameStart", {
            maybeMap: room.gm.export(),
            myColor: -1
          });
        }
      }

      room.gameInterval = setInterval(() => this.game(), 250 / room.voteAns.speed);
    }
  }

  game() {
    const room = roomData.get(this.rid);

    if (!room || !room.ongoing) {
      return;
    }

    const winner = room.winCheck();
    if (winner) {
      this.endGame(winner);
    }

    for (let player of room.surrenders) {
      room.gamingPlayers.delete(player);
      room.colors.delete(room.playerToColor(player));

      this.server.to(SocketRoom.usernameRid(player, this.rid)).emit("die");
      this.server.to(SocketRoom.usernameRid(player, this.rid)).emit("gameStart", {
        maybeMap: room.gm.export(),
        myColor: -1
      });

      room.surrenders.delete(player);

      const winner = room.winCheck();
      if (winner) {
        this.endGame(winner);
        break;
      }
    }

    room.turn++;

    const preMap = room.gm.export(),
      preColors: Room["colors"] = new Map(JSON.parse(JSON.stringify(Array.from(room.colors.entries()))));

    const deaths = room.moveAll();
    for (let deadPlayer of deaths) {
      room.gamingPlayers.delete(deadPlayer);
      room.colors.delete(room.playerToColor(deadPlayer));
      this.server.to(SocketRoom.usernameRid(deadPlayer, this.rid)).emit("die");
    }

    room.addArmy();

    const rank = room.rankAll();

    const patches = room.patchAll(preMap, preColors);
    for (let [player, patch] of patches) {
      this.server.to(SocketRoom.usernameRid(player, this.rid)).emit("patch", patch);
    }

    this.server.to(SocketRoom.rid(this.rid)).emit("rank", rank);
  }

  addMovement(player: string, movement: [Pos, Pos, boolean]) {
    const room = roomData.get(this.rid);

    if (!room || !room.ongoing || !room.gamingPlayers.has(player)) {
      return;
    }

    if (!room.movements.has(player)) {
      room.movements.set(player, []);
    }

    room.movements.get(player)?.push(movement);
  }

  endGame(winner: TeamId) {
    const room = roomData.get(this.rid);

    if (!room || !room.ongoing) {
      return;
    }

    clearInterval(room.gameInterval);
    room.gameEnd();

    const winners = room.teamsInGame.get(winner) as string[];
    this.server.to(SocketRoom.rid(this.rid)).emit("win", winners.join(", "));
    this.server.to(SocketRoom.rid(this.rid)).emit("updateReadyPlayers", room.exportReadyPlayers());
  }

  clearMovements(player: string) {
    const room = roomData.get(this.rid);

    if (!room || !room.ongoing || !room.gamingPlayers.has(player)) {
      return;
    }

    room.movements.delete(player);
  }

  surrender(player: string) {
    const room = roomData.get(this.rid);

    if (!room || !room.ongoing || !room.gamingPlayers.has(player) || !room.playerToColor(player) || room.surrenders.has(player)) {
      return;
    }

    room.surrenders.add(player);
  }

  teamMessage(sender: string, content: string) {
    const room = roomData.get(this.rid);

    if (!room) {
      return;
    }

    if (room.ongoing && !room.gamingPlayers.has(sender) && room.playerToTeam(sender) !== 0) {
      this.server.to(SocketRoom.usernameRid(sender, this.rid)).emit("info", "游戏中仅参战玩家可发送队伍消息");
      return;
    }

    const teams = room.ongoing ? room.teamsInGame : room.teams;

    for (let [, players] of teams) {
      if (players.includes(sender)) {
        for (let receiver of players) {
          this.server.to(SocketRoom.usernameRid(receiver, this.rid)).emit("message", {
            type: MessageType.Team,
            content,
            sender
          });
        }
      }
    }
  }

  vote<T extends VoteItem>(item: T, value: VoteValue<T>, player: string) {
    const room = roomData.get(this.rid);

    if (!room || room.ongoing) {
      return;
    }

    vote(room.voteData, item, value, player);
    room.voteAns = getMaxVotedItem(room.voteData);

    this.server.to(SocketRoom.rid(this.rid)).emit("updateVotes", {
      data: room.voteData,
      ans: room.voteAns
    });
  }
}