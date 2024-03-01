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

import { formatDate, useRelativeDateFormatter } from "~/hooks/datetime";

import UserTag from "../user/userTag";

interface Rank {
  username: string;
  createdAt: string;
}

function Rank({ createdAt, username, id }: Rank & { id: number }) {
  const relativeDate = useRelativeDateFormatter();

  return (
    <Tr>
      <Td>{id + 1}</Td>

      <Td>
        <UserTag username={username} />
      </Td>

      <Td>
        <Tooltip label={formatDate(createdAt)} openDelay={500}>
          {relativeDate(createdAt)}
        </Tooltip>
      </Td>
    </Tr>
  );
}

export default function RegistrationTimeLeaderboard({
  ranks
}: {
  ranks: Rank[];
}) {
  const { t } = useTranslation();

  return (
    <TableContainer w="100%">
      <Table>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>{t("leaderboard.player")}</Th>
            <Th>{t("leaderboard.registration-time")}</Th>
          </Tr>
        </Thead>

        <Tbody>
          {ranks.map(({ createdAt, username }, id) => (
            <Rank key={id} createdAt={createdAt} username={username} id={id} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
