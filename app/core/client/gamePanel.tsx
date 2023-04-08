import { Header, Card, Icon } from "semantic-ui-react";
import { useEffect, useState } from "react";

import type { ClientSocket } from "~/core/types";
import type { Player } from "~/core/server/player";
import { useUser } from "~/utils";
import clsx from "clsx";

export function GamePanel({ client }: { client?: ClientSocket }) {
  const [teamData, setTeamData] = useState<[number, Player[]][]>([]);

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
    });
  }, [client]);

  const user = useUser();

  return (
    <>
      <Header textAlign="center" as="h3">选择队伍</Header>
      <Card.Group centered>
        {teamData.map(([team, players]) => {
          const disabled = players.some(player => player.username === user.username);
          return (
            <Card key={team} className={clsx(disabled && "disabled")}
                  onClick={disabled ? undefined : () => client?.emit("joinTeam", team)}>
              <Card.Content>
                <Card.Header textAlign="center">
                  {team === 0 ? "Spectators" : `Team ${team}`}
                </Card.Header>
                <Card.Description textAlign="center">
                  {players.map(player => player.username).join(", ")}
                </Card.Description>
              </Card.Content>
            </Card>
          );
        })
        }

        {(() => {
          const disabled = !teamData.some(([team, players]) =>
            players.some(player => player.username === user.username) &&
            (team === 0 || players.some(player => player.username !== user.username)));
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
    </>
  )
    ;
}