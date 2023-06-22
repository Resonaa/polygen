import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Header, Table, Grid } from "semantic-ui-react";

import { formatDate, relativeDate, UserLink } from "~/components/community";
import Layout from "~/components/layout";
import { rankList } from "~/models/score.server";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access, useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "排行榜 - polygen" }];

export async function loader({ request }: LoaderArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);
  return json(await rankList());
}

export default function Leaderboard() {
  const rankList = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <Layout columns={1}>
      <Grid.Column>
        <Header as="h3">囚禁竞速挑战赛（模拟赛） - 排行榜</Header>
        <Table basic unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>#</Table.HeaderCell>
              <Table.HeaderCell>用户名</Table.HeaderCell>
              <Table.HeaderCell>回合</Table.HeaderCell>
              <Table.HeaderCell>速度</Table.HeaderCell>
              <Table.HeaderCell>成绩</Table.HeaderCell>
              <Table.HeaderCell>达成时间</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rankList.map(({ id, username, turns, speed, score, updatedAt }, rank) => (
              <Table.Row key={id} active={user?.username === username}>
                <Table.Cell>{rank + 1}</Table.Cell>
                <Table.Cell><UserLink username={username} /></Table.Cell>
                <Table.Cell>{turns}</Table.Cell>
                <Table.Cell>{speed}</Table.Cell>
                <Table.Cell>{score}</Table.Cell>
                <Table.Cell>
                  <span title={formatDate(updatedAt)}>{relativeDate(updatedAt)}</span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Grid.Column>
    </Layout>
  );
}