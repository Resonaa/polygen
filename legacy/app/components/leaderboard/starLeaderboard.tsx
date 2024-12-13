import {
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  Tooltip
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import { formatStar } from "~/core/client/utils";
import { formatDate, useRelativeDateFormatter } from "~/hooks/datetime";

import UserTag from "../user/userTag";

interface Rank {
  star: number;
  updatedAt: Date;
  username: string;
}

function Rank({ star, updatedAt, username, id }: Rank & { id: number }) {
  const relativeDate = useRelativeDateFormatter();

  return (
    <Tr>
      <Td>{id + 1}</Td>

      <Td>
        <UserTag username={username} />
      </Td>

      <Td>
        <Tooltip label={star} openDelay={500}>
          {formatStar(star, 2)}
        </Tooltip>
      </Td>

      <Td>
        <Tooltip label={formatDate(updatedAt)} openDelay={500}>
          {relativeDate(updatedAt)}
        </Tooltip>
      </Td>
    </Tr>
  );
}

export default function StarLeaderboard({ ranks }: { ranks: Rank[] }) {
  const { t } = useTranslation();

  return (
    <TableContainer w="100%">
      <Table>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>{t("leaderboard.player")}</Th>
            <Th color="star">★</Th>
            <Th>{t("leaderboard.updatedAt")}</Th>
          </Tr>
        </Thead>

        <Tbody>
          {ranks.map(({ star, username, updatedAt }, id) => (
            <Rank
              key={id}
              star={star}
              updatedAt={updatedAt}
              username={username}
              id={id}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
