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
import type { IconType } from "react-icons";
import { FaTachometerAlt } from "react-icons/fa";
import { FaCrown, FaMap } from "react-icons/fa6";

import type { MaxVotedItems, VoteItem } from "~/core/server/vote";
import { translations } from "~/core/server/vote";
import { useOptionalUser } from "~/utils";

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
      <Tag borderRadius="full" colorScheme={color}>
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
  const label = data.join("/");
  const description = `${translations[item]}：${label}`;

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

  return (
    <Button
      as={Tr}
      display="table-row"
      fontWeight="normal"
      cursor={user ? "pointer" : undefined}
      onClick={
        user ? () => window.open(`/game/${encodeURIComponent(id)}`) : undefined
      }
      title={user ? undefined : "登录后加入"}
      variant="ghost"
    >
      <Td>{id}</Td>
      <Td gap={2} display="inline-flex">
        {rated ? (
          <RoomProperty
            icon={StarIcon}
            color="green"
            label="Rated"
            description="计入排名"
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
        {ongoing ? "游戏中" : "等待中"}
      </Td>
    </Button>
  );
}

export default function RoomList({ rooms }: { rooms: RoomProps[] }) {
  return (
    <TableContainer w="100%">
      <Table>
        <Thead>
          <Tr>
            <Th fontSize="sm">名称</Th>
            <Th fontSize="sm">属性</Th>
            <Th fontSize="sm">玩家</Th>
            <Th fontSize="sm">状态</Th>
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
