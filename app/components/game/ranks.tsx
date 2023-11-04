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

import UserTag from "../community/userTag";

interface Rank {
  star: number;
  updatedAt: string;
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

export default function Ranks({ ranks }: { ranks: Rank[] }) {
  const { t } = useTranslation();

  return (
    <TableContainer w="100%">
      <Table>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>{t("game.player")}</Th>
            <Th color="#ffd700">★</Th>
            <Th>{t("game.updated-at")}</Th>
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
