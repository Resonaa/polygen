import clsx from "clsx";
import { useEffect, useState } from "react";
import { Header, List, Table } from "semantic-ui-react";

import { padZero } from "~/components/community";
import { colors } from "~/core/client/colors";
import { Vote } from "~/core/client/vote";
import type { LandColor } from "~/core/server/game/land";
import type { MaxVotedItems, VoteData, VoteItem } from "~/core/server/vote";
import { translations } from "~/core/server/vote";
import type { ClientSocket } from "~/core/types";
import { useUser } from "~/utils";

export function RoomInfo({ client, rid }: { client?: ClientSocket, rid: string }) {
  const copyLink = () => window.navigator.clipboard.writeText(window.location.href);
  const [rank, setRank] = useState<[LandColor, string, number, number][]>([]);
  const [voteData, setVoteData] = useState<{ data: VoteData, ans: MaxVotedItems }>();
  const [type, setType] = useState<VoteItem>();
  const [teamData, setTeamData] = useState<[number, string[]][]>([[0, []]]);

  const user = useUser();

  useEffect(() => {
    if (!client) {
      return;
    }

    client.on("rank", rank => setRank(rank))
      .on("updateVotes", voteData => setVoteData(voteData))
      .on("updateTeams", teamData => setTeamData(teamData));
  }, [client]);

  const canVote = !(teamData && teamData.some(([id, players]) => id === 0 && players.includes(user.username)));

  function VoteEntry({ item }: { item: VoteItem }) {
    return (
      <List.Content>
        <strong>{translations[item]}</strong>
        <div title={canVote ? "进入投票" : "旁观玩家无法投票"}
             className={clsx(canVote && "cursor-pointer hover:underline", "float-right")}
             onClick={canVote ? () => setType(item) : undefined}>
          {voteData?.ans[item]}
        </div>
      </List.Content>
    );
  }

  return (
    rank.length === 0 ?
      (
        <>
          <Header textAlign="center" as="h3" className="!pt-1.5">房间信息</Header>
          <Vote type={type} client={client} voteData={voteData} setType={setType} />

          <List relaxed className="!pt-1 !pr-1">
            <List.Item>
              <List.Icon name="hashtag" inverted />
              <List.Content>
                <strong>名称</strong>
                <div title="复制链接" className="cursor-pointer hover:underline float-right" onClick={copyLink}>
                  {rid}
                </div>
              </List.Content>
            </List.Item>

            <List.Item>
              <List.Icon name="chess queen" inverted />
              <VoteEntry item="mode" />
            </List.Item>

            <List.Item>
              <List.Icon name="map" inverted />
              <VoteEntry item="map" />
            </List.Item>

            <List.Item>
              <List.Icon name="dashboard" inverted />
              <VoteEntry item="speed" />
            </List.Item>
          </List>
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