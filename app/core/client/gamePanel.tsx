import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { Header, Card, Icon, Button, Grid, Segment } from "semantic-ui-react";

import { registerClientSocket } from "~/core/client/index";
import { getMinReadyPlayerCount } from "~/core/server/game/utils";
import type { ClientSocket } from "~/core/types";
import { useUser } from "~/utils";

export function GamePanel({ client, rid }: { client?: ClientSocket, rid: string }) {
  const [teamData, setTeamData] = useState<[number, string[]][]>([[0, []]]);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    if (!client) {
      return;
    }

    registerClientSocket(client, rid, setShowCanvas);

    client.on("updateTeams", teamData => {
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
    }).on("updateReadyPlayers", readyPlayers => {
      setReadyPlayers(readyPlayers);
    });
  }, [client, rid]);

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
      <canvas className={clsx("w-full h-full absolute !px-0", !showCanvas && "hidden")} />

      <Grid.Column width={12} className="h-full !p-0 !flex flex-col justify-center items-center">
        <Segment inverted style={{ background: "unset !important" }} className={clsx(showCanvas && "hidden")}>
          <Header textAlign="center" as="h3" className="!pb-2">选择队伍</Header>
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

          <div className="text-center mt-7">
            <Button inverted disabled={teamData.slice(-1)[0][1].includes(user.username)}
                    active={readyPlayers.includes(user.username)} size="large" toggle id="ready"
                    onClick={event => {
                      client?.emit("ready");
                      (event.target as HTMLButtonElement).blur();
                    }}>
              准备开始({readyPlayers.length}/{getMinReadyPlayerCount(teamData.map(([, players]) => players).slice(0, -1).flat().length)})
            </Button>
          </div>
        </Segment>
      </Grid.Column>
    </>
  );
}