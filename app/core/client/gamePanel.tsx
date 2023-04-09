import { Header, Card, Icon, Button } from "semantic-ui-react";
import { Fragment, useEffect, useState } from "react";
import clsx from "clsx";

import type { ClientSocket } from "~/core/types";
import { useUser } from "~/utils";
import { getMinReadyPlayerCount } from "~/core/server/game/utils";

export function GamePanel({ client }: { client?: ClientSocket }) {
  const [teamData, setTeamData] = useState<[number, string[]][]>([[0, []]]);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);

  useEffect(() => {
    client?.off("updateTeams").on("updateTeams", teamData => {
      teamData.sort((a, b) => a[0] - b[0]);

      if (teamData[0][0] === 0) {
        const spectators = teamData.shift();
        if (spectators) {
          teamData.push(spectators);
        }
      } else {
        teamData.push([0, []]);
      }

      setTeamData(teamData);
    })?.off("updateReadyPlayers")?.on("updateReadyPlayers", readyPlayers => {
      setReadyPlayers(readyPlayers);
    });
  }, [client]);

  const user = useUser();

  function PlayerList({ players }: { players: string[] }) {
    return (
      <>
        {players.map((player, index) => {
          const isCurrent = player === user.username, isReady = readyPlayers.includes(player);
          const Player = <>{isReady ? <u>{player}</u> : player}</>;
          return (
            <Fragment key={index}>
              {isCurrent ? <strong>{Player}</strong> : Player}
              {index !== players.length - 1 && ", "}
            </Fragment>
          );
        })}
      </>
    );
  }

  return (
    <>
      <Header textAlign="center" as="h3">选择队伍</Header>
      <Card.Group centered>
        {teamData.map(([team, players]) => {
          const disabled = players.includes(user.username);
          return (
            <Card key={team} className={clsx(disabled && "disabled")}
                  onClick={disabled ? undefined : () => client?.emit("joinTeam", team)}>
              <Card.Content>
                <Card.Header textAlign="center">
                  {team === 0 ? "Spectators" : `Team ${team}`}
                </Card.Header>
                <Card.Description textAlign="center">
                  <PlayerList players={players} />
                </Card.Description>
              </Card.Content>
            </Card>
          );
        })
        }

        {(() => {
          const disabled = !teamData.some(([team, players]) =>
            players.includes(user.username) &&
            (team === 0 || players.some(player => player !== user.username)));
          return (
            <Card
              onClick={disabled ? undefined : () => client?.emit("joinTeam", undefined)}
              className={clsx(disabled && "disabled")}>
              <Card.Content>
                <Card.Header textAlign="center">
                  <Icon name="add circle" />
                </Card.Header>
                <Card.Description textAlign="center">
                  创建新队伍
                </Card.Description>
              </Card.Content>
            </Card>
          );
        })()}
      </Card.Group>

      <div className="text-center mt-4">
        <Button inverted color="green" disabled={teamData.slice(-1)[0][1].includes(user.username)}
                active={readyPlayers.includes(user.username)}
                onClick={event => {
                  client?.emit("ready");
                  (event.target as HTMLButtonElement).blur();
                }}>
          准备开始({readyPlayers.length}/{getMinReadyPlayerCount(teamData.map(([, players]) => players).slice(0, -1).flat().length)})
        </Button>
      </div>
    </>
  );
}