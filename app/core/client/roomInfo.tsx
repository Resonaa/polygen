import clsx from "clsx";
import LZString from "lz-string";
import { useEffect, useState } from "react";
import { Header, List, Table } from "semantic-ui-react";

import { Star } from "~/components/community";
import { formatStar } from "~/core/client/utils";
import { Vote } from "~/core/client/vote";
import type { LandColor } from "~/core/server/game/land";
import type { MaxVotedItems, VoteData, VoteItem } from "~/core/server/vote";
import { translations } from "~/core/server/vote";
import type { ClientSocket, Patch } from "~/core/types";
import { useUser } from "~/hooks/loader";
import { numberColorToString } from "~/utils";

import { getSettings, Settings } from "../client/settings";

export function RoomInfo({
  client,
  rid
}: {
  client?: ClientSocket;
  rid: string;
}) {
  const copyLink = () =>
    window.navigator.clipboard.writeText(window.location.href);
  const [rank, setRank] = useState<
    [number | null, LandColor, string, number, number][]
  >([]);
  const [voteData, setVoteData] = useState<{
    data: VoteData;
    ans: MaxVotedItems;
  }>();
  const [type, setType] = useState<VoteItem>();
  const [teamData, setTeamData] = useState<[number, string[]][]>([[0, []]]);
  const [smallTable, setSmallTable] = useState(false);

  const user = useUser();

  const [colors, setColors] = useState(
    Settings.defaultSettings.game.colors.standard.map(number =>
      numberColorToString(number)
    )
  );

  useEffect(() => {
    if (!client) {
      return;
    }

    client
      .on("patch", data =>
        setRank((JSON.parse(LZString.decompressFromUTF16(data)) as Patch).rank)
      )
      .on("updateVotes", voteData => setVoteData(voteData))
      .on("updateTeams", teamData => setTeamData(teamData));

    const settings = getSettings();
    setColors(
      settings.game.colors.standard.map(number => numberColorToString(number))
    );
  }, [client]);

  const canVote = !teamData.some(
    ([id, players]) => id === 0 && players.includes(user.username)
  );

  function VoteEntry({ item }: { item: VoteItem }) {
    return (
      <List.Content>
        <strong>{translations[item]}</strong>
        <button
          title={canVote ? "进入投票" : "旁观玩家无法投票"}
          className={clsx(
            canVote && "cursor-pointer hover:underline",
            "float-right"
          )}
          onClick={canVote ? () => setType(item) : undefined}
        >
          {voteData?.ans[item]}
        </button>
      </List.Content>
    );
  }

  return rank.length === 0 ? (
    <>
      <Header textAlign="center" as="h4" className="!pt-1.5">
        房间信息
      </Header>
      <Vote type={type} client={client} voteData={voteData} setType={setType} />

      <List relaxed className="!pt-1 !pr-1">
        <List.Item>
          <List.Icon name="hashtag" inverted />
          <List.Content>
            <strong>名称</strong>
            <button
              title="复制链接"
              className="cursor-pointer hover:underline float-right"
              onClick={copyLink}
            >
              {rid}
            </button>
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
    <Table
      inverted
      compact
      singleLine
      size="large"
      unstackable
      textAlign="center"
      className="select-none cursor-pointer"
      onClick={() => setSmallTable(smallTable => !smallTable)}
    >
      <Table.Header>
        <Table.Row>
          {!smallTable ? (
            <>
              <Table.HeaderCell className="!cursor-pointer">
                <Star />
              </Table.HeaderCell>
              <Table.HeaderCell className="!cursor-pointer">
                玩家
              </Table.HeaderCell>
            </>
          ) : null}
          <Table.HeaderCell className="!cursor-pointer">兵力</Table.HeaderCell>
          <Table.HeaderCell className="!cursor-pointer">领地</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {rank.map(([star, color, player, land, army]) => (
          <Table.Row key={player}>
            {!smallTable ? (
              <>
                {star !== null ? (
                  <Table.Cell>{formatStar(star)}</Table.Cell>
                ) : null}
                <td
                  colSpan={star !== null ? 1 : 2}
                  style={
                    color === -1 ? undefined : { background: colors[color] }
                  }
                >
                  {player}
                </td>
              </>
            ) : null}

            <Table.Cell
              style={
                smallTable && color !== -1
                  ? { boxShadow: `.3em 0 0 0 ${colors[color]} inset` }
                  : undefined
              }
            >
              {army}
            </Table.Cell>
            <Table.Cell>{land}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
