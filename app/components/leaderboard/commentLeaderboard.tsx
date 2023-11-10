import {
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  Td
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import UserTag from "../community/userTag";

interface Rank {
  username: string;
  _count: {
    comments: number;
  };
}

function Rank({ _count: { comments }, username, id }: Rank & { id: number }) {
  return (
    <Tr>
      <Td>{id + 1}</Td>

      <Td>
        <UserTag username={username} />
      </Td>

      <Td>{comments}</Td>
    </Tr>
  );
}

export default function CommentLeaderboard({ ranks }: { ranks: Rank[] }) {
  const { t } = useTranslation();

  return (
    <TableContainer w="100%">
      <Table>
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>{t("leaderboard.player")}</Th>
            <Th>{t("leaderboard.comments")}</Th>
          </Tr>
        </Thead>

        <Tbody>
          {ranks.map(({ _count, username }, id) => (
            <Rank key={id} _count={_count} username={username} id={id} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
