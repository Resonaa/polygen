import type { IconProps } from "@chakra-ui/icons";
import { StarIcon } from "@chakra-ui/icons";
import type { ComponentWithAs } from "@chakra-ui/react";
import {
  Box,
  Button,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { FaTachometerAlt } from "react-icons/fa";
import { FaCrown, FaMap } from "react-icons/fa6";

import type { MaxVotedItems, VoteItem } from "~/core/server/vote";
import { useOptionalUser } from "~/hooks/loader";
import type { TFunctionArg } from "~/i18next";

import UserTag from "../community/userTag";

interface RoomProps {
  id: string;
  ongoing: boolean;
  players: string[];
  rated: boolean;
  votes: MaxVotedItems;
}

function RoomProperty({
  icon,
  color,
  label,
  description
}: {
  icon: ComponentWithAs<"svg", IconProps> | IconType;
  color: string;
  label: string;
  description: string;
}) {
  return (
    <Tooltip label={description}>
      <Tag colorScheme={color}>
        <TagLeftIcon as={icon} boxSize={3} />
        <TagLabel>{label}</TagLabel>
      </Tag>
    </Tooltip>
  );
}

function VotedRoomProperty<T extends VoteItem>({
  icon,
  color,
  data,
  item
}: {
  icon: ComponentWithAs<"svg", IconProps> | IconType;
  data: MaxVotedItems[T];
  color: string;
  item: T;
}) {
  const { t } = useTranslation();

  const label = data
    .map(s => {
      if (typeof s === "number") {
        return s.toString();
      } else {
        return t(`game.vote-value-${s.toLowerCase()}` as TFunctionArg);
      }
    })
    .join("/");

  const description = `${t(
    ("game.vote-item-" + item) as TFunctionArg
  )}: ${label}`;

  return (
    <RoomProperty
      icon={icon}
      color={color}
      label={label}
      description={description}
    />
  );
}

function Room({ id, ongoing, players, rated, votes }: RoomProps) {
  const user = useOptionalUser();
  const { t } = useTranslation();

  return (
    <Button
      as={Tr}
      display="table-row"
      fontWeight="normal"
      cursor={user ? "pointer" : undefined}
      onClick={user ? () => open(`/game/${encodeURIComponent(id)}`) : undefined}
      title={user ? undefined : t("game.join-after-login")}
      variant="ghost"
    >
      <Td>{id}</Td>
      <Td gap={2} display="inline-flex">
        {rated ? (
          <RoomProperty
            icon={StarIcon}
            color="green"
            label="Rated"
            description={t("game.rated")}
          />
        ) : null}
        <VotedRoomProperty
          icon={FaCrown}
          color="orange"
          data={votes.mode}
          item="mode"
        />
        <VotedRoomProperty
          icon={FaMap}
          color="cyan"
          data={votes.map}
          item="map"
        />
        <VotedRoomProperty
          icon={FaTachometerAlt}
          color="yellow"
          data={votes.speed}
          item="speed"
        />
      </Td>
      <Td>
        <Box gap={2} display="inline-flex">
          {players.map(username => (
            <UserTag username={username} key={username} />
          ))}
        </Box>
      </Td>
      <Td color={ongoing ? "blue.400" : "green.400"}>
        {ongoing ? t("game.playing") : t("game.waiting")}
      </Td>
    </Button>
  );
}

export default function RoomList({ rooms }: { rooms: RoomProps[] }) {
  const { t } = useTranslation();

  return (
    <TableContainer w="100%">
      <Table>
        <Thead>
          <Tr>
            <Th>{t("game.id")}</Th>
            <Th>{t("game.properties")}</Th>
            <Th>{t("game.players")}</Th>
            <Th>{t("game.status")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rooms.map(({ id, ongoing, votes, players, rated }) => (
            <Room
              key={id}
              ongoing={ongoing}
              votes={votes}
              id={id}
              players={players}
              rated={rated}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
