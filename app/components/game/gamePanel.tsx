import {
  Button,
  Center,
  chakra,
  Heading,
  HStack,
  SimpleGrid,
  useColorModeValue
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { registerClientSocket } from "~/core/client";
import { getMinReadyPlayerCount } from "~/core/server/game/utils";
import type { ClientSocket } from "~/core/types";
import { useUser } from "~/utils";

import UserTag from "../community/userTag";

function PlayerList({
  players,
  readyPlayers
}: {
  players: string[];
  readyPlayers: string[];
}) {
  return (
    <HStack gap={2} mt={2}>
      {players.map(username => (
        <UserTag
          username={username}
          key={username}
          textDecoration={
            readyPlayers.includes(username) ? "underline" : undefined
          }
        />
      ))}
    </HStack>
  );
}

function TeamCard({
  title,
  children,
  disabled,
  onClick
}: {
  title: string;
  children?: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      as={Center}
      flexDir="column"
      h="unset"
      p={2}
      cursor={disabled ? "unset" : "pointer"}
      onClick={disabled ? undefined : onClick}
      variant="outline"
    >
      <Heading size="md">{title}</Heading>
      {children}
    </Button>
  );
}

export default function GamePanel({
  client,
  rid
}: {
  client?: ClientSocket;
  rid: string;
}) {
  const [teamData, setTeamData] = useState<[number, string[]][]>([[0, []]]);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [showCanvas, setShowCanvas] = useState(false);

  const backgroundColor = useColorModeValue(0xffffff, 0x1a202c);

  useEffect(() => {
    if (!client) {
      return;
    }

    registerClientSocket(client, rid, setShowCanvas, backgroundColor);

    client
      .on("updateTeams", teamData => {
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
      })
      .on("updateReadyPlayers", readyPlayers => {
        setReadyPlayers(readyPlayers);
      });
  }, [client, rid, backgroundColor]);

  const user = useUser();

  const canCreateTeam = teamData.some(
    ([team, players]) =>
      players.includes(user.username) &&
      (team === 0 || players.some(player => player !== user.username))
  );

  const isSpectating = teamData.slice(-1)[0][1].includes(user.username);

  const isReady = readyPlayers.includes(user.username);

  return (
    <>
      <chakra.canvas w="100%" h="100%" pos="absolute" hidden={!showCanvas} />

      <Center flexDir="column" gap={4} h="100%" hidden={showCanvas}>
        <Heading size="md">选择队伍</Heading>
        <SimpleGrid gap={3} w="100%" minChildWidth="120px">
          {teamData.map(([team, players]) => {
            const disabled = players.includes(user.username);
            const title = team === 0 ? "Spectators" : `Team ${team}`;
            return (
              <TeamCard
                key={team}
                title={title}
                disabled={disabled}
                onClick={() => client?.emit("joinTeam", team)}
              >
                <PlayerList players={players} readyPlayers={readyPlayers} />
              </TeamCard>
            );
          })}

          <TeamCard
            title="创建新队伍"
            disabled={!canCreateTeam}
            onClick={() => client?.emit("joinTeam", undefined)}
          />
        </SimpleGrid>

        <Button
          w="100%"
          isDisabled={isSpectating}
          onClick={event => {
            client?.emit("ready");
            (event.target as HTMLButtonElement).blur();
          }}
          size="lg"
          variant={isReady ? "solid" : "outline"}
        >
          准备开始({readyPlayers.length}/
          {getMinReadyPlayerCount(
            teamData
              .map(([, players]) => players)
              .slice(0, -1)
              .flat().length
          )}
          )
        </Button>
      </Center>
    </>
  );
}
