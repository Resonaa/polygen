import _ from "lodash";
import LZString from "lz-string";
import { rate, rating } from "openskill";

import { generateMap } from "~/core/server/game/generator";
import type { LandColor, MaybeLand } from "~/core/server/game/land";
import { LandType } from "~/core/server/game/land";
import type { MaybeMap } from "~/core/server/game/map";
import { Map as GameMap } from "~/core/server/game/map";
import type { Pos } from "~/core/server/game/utils";
import { getMinReadyPlayerCount } from "~/core/server/game/utils";
import { MessageType } from "~/core/server/message";
import type {
  SampleMaxVotedItems,
  VoteItem,
  VoteValue
} from "~/core/server/vote";
import { VoteManager } from "~/core/server/vote";
import type { Server } from "~/core/types";
import type { Star } from "~/models/star.server";
import { getStarOrCreate, updateStar } from "~/models/star.server";

export const SocketRoom = {
  rid: (rid: string) => `#${rid}`,
  usernameRid: (username: string, rid: string) => `@${username}#${rid}`
};

export type TeamId = number;

const ratedRooms = ["161"];

export class Room {
  id: string;

  gm = new GameMap();

  votes = new VoteManager();
  voteAns: SampleMaxVotedItems = this.votes.sample();

  teams = new Map<TeamId, string[]>();
  readyPlayers = new Set<string>();

  ongoing = false;

  colors = new Map<LandColor, string>();
  teamsInGame = new Map<TeamId, string[]>();
  gameTeams = new Map<LandColor, TeamId>();
  gamingPlayers = new Set<string>();
  gameInterval: NodeJS.Timeout | undefined;
  movements = new Map<string, [Pos, Pos, boolean][]>();
  turns = 0;
  surrenders = new Set<string>();

  playerMaps = new Map<string, MaybeMap>();

  rated = false;
  ranks = new Array<TeamId>();
  stars = new Map<string, Star>();

  constructor(id: string) {
    this.id = id;
    if (ratedRooms.includes(id)) {
      this.rated = true;
    }
  }

  export() {
    this.simplifyTeams();
    const players = this.exportPlayers();
    return {
      id: this.id,
      ongoing: this.ongoing,
      players,
      rated: this.rated,
      votes: this.votes.ans
    };
  }

  simplifyTeams() {
    if (this.ongoing) {
      return;
    }

    const newTeams: typeof this.teams = new Map();
    let teamCnt = 1;

    for (const [team, players] of this.teams) {
      if (players.length === 0) {
        continue;
      }

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
    this.playerMaps.delete(player);

    for (const [team, players] of this.teams) {
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
      team = this.ongoing
        ? this.playerToTeam(player, this.teamsInGame)
        : this.getNewTeamId();
    }

    const item = this.teams.get(team);
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
    this.readyPlayers.clear();
    this.playerMaps.clear();
    this.stars.clear();
    this.turns = 0;

    let players: string[] = [];
    for (const [teamId, playersInTeam] of this.teams) {
      if (teamId === 0) {
        continue;
      }

      for (const player of playersInTeam) {
        this.gamingPlayers.add(player);
      }

      players.push(...playersInTeam);
    }

    this.ongoing = true;

    this.voteAns = this.votes.sample();
    this.gm = generateMap(
      this.gamingPlayers.size,
      this.voteAns.mode,
      this.voteAns.map
    );

    players = _.shuffle(players);

    this.colors = new Map(
      Array.from(players.entries()).map(([color, player]) => [
        color + 1,
        player
      ])
    );
    this.gameTeams.clear();
    for (const [color, player] of this.colors) {
      this.gameTeams.set(color, this.playerToTeam(player));
    }

    this.teamsInGame = _.cloneDeep(this.teams);
  }

  playerToColor(player: string) {
    for (const [color, username] of this.colors) {
      if (username === player) {
        return color;
      }
    }

    return 0;
  }

  maskAll() {
    return Array.from(this.colors.keys()).map(color =>
      this.gm.mask(color, this.gameTeams)
    );
  }

  winCheck() {
    let winner = undefined;

    for (const player of this.gamingPlayers) {
      const color = this.playerToColor(player);
      const team = this.gameTeams.get(color)!;

      if (winner === undefined) {
        winner = team;
      } else if (winner !== team) {
        return undefined;
      }
    }

    return winner;
  }

  playerToTeam(player: string, teams: Room["teams"] = this.teams) {
    const res = Array.from(teams.entries()).find(([, players]) =>
      players.includes(player)
    );
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
    this.ranks = [];

    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }

    this.gameInterval = undefined;
  }

  checkMovement([from, to]: [Pos, Pos, boolean], color: LandColor) {
    if (!this.gm.check(from) || !this.gm.check(to) || !this.gm.accessible(to)) {
      return false;
    }

    const fromLand = this.gm.get(from);
    return (
      !(fromLand.color !== color || fromLand.amount < 1) &&
      this.gm.neighbors(from).some(neighbor => neighbor.join() === to.join())
    );
  }

  handleMove([from, to, halfTag]: [Pos, Pos, boolean]) {
    const fromLand = this.gm.get(from),
      toLand = this.gm.get(to);
    const moved = halfTag ? Math.floor(fromLand.amount / 2) : fromLand.amount;

    if (
      this.gameTeams.get(fromLand.color) === this.gameTeams.get(toLand.color)
    ) {
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
        toLand.amount = -toLand.amount - 1;
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
    const deaths: string[] = [];

    for (const [color, player] of this.colors) {
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
        } else if (land.type === LandType.Land && this.turns % 25 === 0) {
          land.amount++;
        }
      }
    }
  }

  patchAll() {
    const res = new Map<string, [number, Partial<MaybeLand>][]>();
    for (const player of this.exportPlayers()) {
      const now = this.gm.mask(this.playerToColor(player), this.gameTeams);

      let pre = this.playerMaps.get(player);
      if (!pre) {
        pre = new GameMap(this.gm.width, this.gm.height, this.gm.mode).export();
      }

      const patch: [number, Partial<MaybeLand>][] = [];

      for (let i = 1; i <= this.gm.height; i++) {
        for (let j = 1; j <= this.gm.width; j++) {
          const preLand = pre.gm[i][j],
            nowLand = now.gm[i][j];
          const partial: Partial<MaybeLand> = {};

          if (preLand.c !== nowLand.c) {
            partial.c = nowLand.c;
          }

          if (preLand.t !== nowLand.t) {
            partial.t = nowLand.t;
          }

          if (preLand.a !== nowLand.a) {
            partial.a = nowLand.a - preLand.a;
          }

          if (
            partial.a !== undefined ||
            partial.c !== undefined ||
            partial.t !== undefined
          ) {
            patch.push([(i - 1) * this.gm.width + j, partial]);
          }
        }
      }

      res.set(player, patch);

      this.playerMaps.set(player, now);
    }

    return res;
  }

  rankAll() {
    const ans: [number | null, LandColor, string, number, number][] = [],
      data = new Map<LandColor, [number, number]>();

    for (let i = 1; i <= this.gm.height; i++) {
      for (let j = 1; j <= this.gm.width; j++) {
        const land = this.gm.get([i, j]);
        if (
          land.color === 0 ||
          !this.colors.has(land.color) ||
          !this.gamingPlayers.has(this.colors.get(land.color)!)
        ) {
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

    const teamData = new Map<TeamId, [number, number]>();

    for (const [color, [land, army]] of data) {
      const username = this.colors.get(color)!;
      const star = this.stars.get(username)!.star;
      ans.push([star, color, username, land, army]);

      const team = this.gameTeams.get(color)!;
      const datum = teamData.get(team);
      if (!datum) {
        teamData.set(team, [land, army]);
      } else {
        teamData.set(team, [land + datum[0], army + datum[1]]);
      }
    }

    ans.sort((a, b) => {
      const teamA = this.gameTeams.get(a[1])!,
        teamB = this.gameTeams.get(b[1])!;
      if (teamA !== teamB) {
        const dataA = teamData.get(teamA)!,
          dataB = teamData.get(teamB)!;
        return dataA[1] !== dataB[1]
          ? dataB[1] - dataA[1]
          : dataB[0] !== dataA[0]
            ? dataB[0] - dataA[0]
            : teamA - teamB;
      } else {
        const dataA = data.get(a[1])!,
          dataB = data.get(b[1])!;
        return dataA[1] !== dataB[1]
          ? dataB[1] - dataA[1]
          : dataB[0] !== dataA[0]
            ? dataB[0] - dataA[0]
            : a[1] - b[1];
      }
    });

    if (
      Array.from(this.teamsInGame.entries()).some(
        ([teamId, players]) => teamId !== 0 && players.length > 1
      )
    ) {
      let lastTeam = 0;
      for (let i = 0; i < ans.length; i++) {
        const color = ans[i][1];
        const team = this.gameTeams.get(color)!;
        if (team !== lastTeam) {
          lastTeam = team;
          const [land, army] = teamData.get(team)!;
          ans.splice(i, 0, [null, -1, `Team ${team}`, land, army]);
        }
      }
    }

    return ans;
  }
}

export const roomData = new Map<string, Room>();

export class RoomManager {
  private server: Server;
  room: Room | undefined;

  constructor(server: Server) {
    this.server = server;
  }

  updateVotes() {
    const room = this.room;

    if (!room) {
      return;
    }

    this.server.to(SocketRoom.rid(room.id)).emit("updateVotes", {
      data: room.votes.data,
      ans: room.votes.ans
    });
  }

  join(player: string, rid: string) {
    let room = roomData.get(rid);

    if (!room) {
      room = new Room(rid);
      roomData.set(rid, room);
    }

    this.room = room;

    if (room.exportPlayers().includes(player)) {
      return false;
    }

    room.addPlayer(player);
    if (
      room.ongoing &&
      !room.gamingPlayers.has(player) &&
      room.playerToColor(player) !== 0
    ) {
      room.gamingPlayers.add(player);
    }

    this.server.to(SocketRoom.rid(room.id)).emit("info", `${player}进入了房间`);
    this.server
      .to(SocketRoom.rid(room.id))
      .emit("updateTeams", room.exportTeams());
    this.server
      .to(SocketRoom.rid(room.id))
      .emit("updateReadyPlayers", room.exportReadyPlayers());

    this.updateVotes();

    if (room.ongoing) {
      if (room.gamingPlayers.has(player)) {
        const myColor = room.playerToColor(player);
        const maybeMap = room.gm.mask(myColor, room.gameTeams);
        this.server
          .to(SocketRoom.usernameRid(player, room.id))
          .emit("gameStart", {
            maybeMap,
            myColor,
            turns: room.turns
          });
        room.playerMaps.set(player, maybeMap);
        const team = room.gameTeams.get(myColor)!;
        const index = room.ranks.indexOf(team);
        if (index !== -1) {
          room.ranks.splice(index, 1);
        }
      } else {
        const maybeMap = room.gm.export();
        this.server
          .to(SocketRoom.usernameRid(player, room.id))
          .emit("gameStart", {
            maybeMap,
            myColor: -1,
            turns: room.turns
          });
        room.playerMaps.set(player, maybeMap);
      }
    }

    return true;
  }

  async leave(player: string) {
    const room = this.room;

    if (!room) {
      return;
    }

    if (room.removePlayer(player)) {
      room.readyPlayers.delete(player);
      const shouldUpdateVotes = room.votes.remove(player);

      this.server
        .to(SocketRoom.rid(room.id))
        .emit("info", `${player}离开了房间`);
      this.server
        .to(SocketRoom.rid(room.id))
        .emit("updateTeams", room.exportTeams());
      this.server
        .to(SocketRoom.rid(room.id))
        .emit("updateReadyPlayers", room.exportReadyPlayers());
      shouldUpdateVotes && this.updateVotes();

      if (room.teams.size === 0) {
        roomData.delete(room.id);

        if (room.ongoing) {
          room.gameEnd();
        }

        this.room = undefined;
      }

      if (room.ongoing) {
        this.checkTeamDeath(player);

        const winner = room.winCheck();
        if (winner) {
          await this.endGame(winner);
        }
      }
    }

    await this.checkStart();
  }

  async team(player: string, team?: number) {
    const room = this.room;

    if (!room) {
      return;
    }

    const shouldUpdateReadyPlayers = room.addPlayer(player, team);

    this.server
      .to(SocketRoom.rid(room.id))
      .emit("updateTeams", room.exportTeams());

    if (shouldUpdateReadyPlayers) {
      this.server
        .to(SocketRoom.rid(room.id))
        .emit("updateReadyPlayers", room.exportReadyPlayers());
    }

    if (team === 0) {
      const shouldUpdateVotes = room.votes.remove(player);
      shouldUpdateVotes && this.updateVotes();
    }

    await this.checkStart();
  }

  async ready(player: string) {
    const room = this.room;

    if (!room) {
      return;
    }

    room.toggleReady(player);

    this.server
      .to(SocketRoom.rid(room.id))
      .emit("updateReadyPlayers", room.exportReadyPlayers());

    await this.checkStart();
  }

  async checkStart() {
    const room = this.room;

    if (!room || room.ongoing) {
      return;
    }

    const allPlayers = Array.from(room.teams.entries())
        .filter(([teamId]) => teamId !== 0)
        .map(([, players]) => players)
        .flat(),
      readyPlayers = room.exportReadyPlayers();

    if (
      allPlayers.length >= 2 &&
      readyPlayers.length >= getMinReadyPlayerCount(allPlayers.length)
    ) {
      const teamCount = room
        .exportTeams()
        .filter(
          ([teamId, players]) => teamId !== 0 && players.length > 0
        ).length;
      if (teamCount < 2) {
        return;
      }

      this.updateVotes();

      room.gameStart();
      if (room.rated) {
        for (const player of room.gamingPlayers) {
          room.stars.set(player, await getStarOrCreate(player));
        }
      }
      const masks = room.maskAll();

      for (const [color, player] of room.colors) {
        this.server
          .to(SocketRoom.usernameRid(player, room.id))
          .emit("gameStart", {
            maybeMap: masks[color - 1],
            myColor: color,
            turns: 0
          });
        room.playerMaps.set(player, masks[color - 1]);
      }

      const exportedMap = room.gm.export();

      for (const player of room.exportPlayers()) {
        if (!room.gamingPlayers.has(player)) {
          this.server
            .to(SocketRoom.usernameRid(player, room.id))
            .emit("gameStart", {
              maybeMap: exportedMap,
              myColor: -1,
              turns: 0
            });
          room.playerMaps.set(player, exportedMap);
        }
      }

      room.gameInterval = setInterval(
        () => this.game(),
        250 / room.voteAns.speed
      );
    }
  }

  checkTeamDeath(deadPlayer: string) {
    const room = this.room;

    if (!room || !room.ongoing) {
      return;
    }

    const deadColor = room.playerToColor(deadPlayer);

    if (deadColor === 0) {
      return;
    }

    const team = room.gameTeams.get(deadColor)!;
    let teamDied = true;
    for (const [color] of room.colors) {
      if (color !== deadColor && room.gameTeams.get(color) === team) {
        teamDied = false;
        break;
      }
    }
    if (teamDied) {
      room.ranks.push(team);
    }
  }

  async game() {
    const room = this.room;

    if (!room || !room.ongoing) {
      return;
    }

    const winner = room.winCheck();
    if (winner) {
      await this.endGame(winner);
    }

    const exportedMap = room.gm.export();

    for (const player of room.surrenders) {
      this.checkTeamDeath(player);

      room.gamingPlayers.delete(player);
      room.colors.delete(room.playerToColor(player));

      this.server
        .to(SocketRoom.usernameRid(player, room.id))
        .emit("info", "您死了");
      this.server
        .to(SocketRoom.usernameRid(player, room.id))
        .emit("gameStart", {
          maybeMap: exportedMap,
          myColor: -1,
          turns: room.turns
        });

      room.playerMaps.set(player, exportedMap);

      room.surrenders.delete(player);

      const winner = room.winCheck();
      if (winner) {
        await this.endGame(winner);
        break;
      }
    }

    room.turns++;

    const deaths = room.moveAll();
    for (const deadPlayer of deaths) {
      this.checkTeamDeath(deadPlayer);
      room.gamingPlayers.delete(deadPlayer);
      room.colors.delete(room.playerToColor(deadPlayer));
      this.server
        .to(SocketRoom.usernameRid(deadPlayer, room.id))
        .emit("info", "您死了");
    }

    room.addArmy();

    const rank = room.rankAll();

    const patches = room.patchAll();
    for (const [player, updates] of patches) {
      this.server.to(SocketRoom.usernameRid(player, room.id)).emit(
        "patch",
        LZString.compressToUTF16(
          JSON.stringify({
            updates,
            rank
          })
        )
      );
    }
  }

  addMovement(player: string, movement: [Pos, Pos, boolean]) {
    const room = this.room;

    if (!room || !room.ongoing || !room.gamingPlayers.has(player)) {
      return;
    }

    if (!room.movements.has(player)) {
      room.movements.set(player, []);
    }

    room.movements.get(player)?.push(movement);
  }

  async endGame(winner: TeamId) {
    const room = this.room;

    if (!room || !room.ongoing) {
      return;
    }

    clearInterval(room.gameInterval);

    room.ongoing = false;

    if (room.rated) {
      room.ranks.push(winner);
      room.ranks.reverse();

      const data = room.ranks.map(teamId =>
        room.teamsInGame
          .get(teamId)!
          .map(username => rating(room.stars.get(username)))
      );

      const res = rate(data);

      for (const [index, team] of res.entries()) {
        for (const [userIndex, username] of room.teamsInGame
          .get(room.ranks[index])!
          .entries()) {
          await updateStar(username, team[userIndex].mu, team[userIndex].sigma);
        }
      }
    }

    const winners = room.teamsInGame.get(winner)!;

    this.server.to(SocketRoom.rid(room.id)).emit("win", winners.join(", "));
    this.server.to(SocketRoom.rid(room.id)).emit(
      "patch",
      LZString.compressToUTF16(
        JSON.stringify({
          updates: [],
          rank: []
        })
      )
    );
    this.server
      .to(SocketRoom.rid(room.id))
      .emit("updateReadyPlayers", room.exportReadyPlayers());

    room.gameEnd();
  }

  clearMovements(player: string) {
    const room = this.room;

    if (!room || !room.ongoing || !room.gamingPlayers.has(player)) {
      return;
    }

    room.movements.delete(player);
  }

  undoMovement(player: string) {
    const room = this.room;

    if (!room || !room.ongoing || !room.gamingPlayers.has(player)) {
      return;
    }

    room.movements.get(player)?.pop();
  }

  surrender(player: string) {
    const room = this.room;

    if (
      !room ||
      !room.ongoing ||
      !room.gamingPlayers.has(player) ||
      !room.playerToColor(player) ||
      room.surrenders.has(player)
    ) {
      return;
    }

    room.surrenders.add(player);
  }

  roomMessage(sender: string, content: string) {
    const room = this.room;

    if (!room) {
      return;
    }

    this.server
      .to(SocketRoom.rid(room.id))
      .emit("message", { type: MessageType.Room, content, sender });
  }

  teamMessage(sender: string, content: string) {
    const room = this.room;

    if (!room) {
      return;
    }

    if (
      room.ongoing &&
      !room.gamingPlayers.has(sender) &&
      room.playerToTeam(sender) !== 0
    ) {
      this.server
        .to(SocketRoom.usernameRid(sender, room.id))
        .emit("info", "游戏中仅参战玩家可发送队伍消息");
      return;
    }

    const teams = room.ongoing ? room.teamsInGame : room.teams;

    for (const [, players] of teams) {
      if (players.includes(sender)) {
        for (const receiver of players) {
          this.server
            .to(SocketRoom.usernameRid(receiver, room.id))
            .emit("message", {
              type: MessageType.Team,
              content,
              sender
            });
        }
      }
    }
  }

  vote<T extends VoteItem>(item: T, value: VoteValue<T>, player: string) {
    const room = this.room;

    if (!room || room.ongoing) {
      return;
    }

    room.votes.add(item, value, player);

    this.updateVotes();
  }
}
