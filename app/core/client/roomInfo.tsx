import clsx from "clsx";
import { useEffect, useState } from "react";
import { Icon, Table } from "semantic-ui-react";

import { padZero } from "~/components/community";
import { colors } from "~/core/client/colors";
import type { LandColor } from "~/core/server/game/land";
import type { ClientSocket } from "~/core/types";
import { useUser } from "~/utils";

export function RoomInfo({ client, rid }: { client?: ClientSocket, rid: string }) {
  const copyLink = () => window.navigator.clipboard.writeText(window.location.href);
  const [rank, setRank] = useState<[LandColor, string, number, number][]>([]);
  const user = useUser();

  useEffect(() => {
    if (!client) {
      return;
    }

    client.on("rank", rank => setRank(rank));
  }, [client]);

  return (
    rank.length === 0 ?
      (
        <>
          房间名称：
          <span title="复制链接" className="cursor-pointer hover:underline" onClick={copyLink}>
            {rid}<Icon name="copy" size="mini" />
          </span>
        </>
      ) : (
        <Table inverted compact singleLine size="large">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>玩家</Table.HeaderCell>
              <Table.HeaderCell>领地</Table.HeaderCell>
              <Table.HeaderCell>兵力</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rank.map(([color, player, land, army]) => (
              <Table.Row key={player}>
                <td className={clsx(player === user.username && "font-bold")}
                    style={color === -1 ? undefined : { color: `#${padZero(colors[color].toString(16), 6)}` }}>{player}</td>
                <Table.Cell>{land}</Table.Cell>
                <Table.Cell>{army}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )
  );
}