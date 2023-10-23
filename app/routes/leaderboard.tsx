import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Header, Table, Grid } from "semantic-ui-react";

import Access from "~/access";
import {
  formatDate,
  relativeDate,
  Star,
  UserLink
} from "~/components/community";
import Layout from "~/components/layout";
import { formatStar } from "~/core/client/utils";
import { rankList } from "~/models/star.server";
import { requireOptionalUser } from "~/session.server";
import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => [{ title: "排行榜 - polygen" }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireOptionalUser(request, Access.Basic);
  return json(await rankList());
}

export default function Leaderboard() {
  const rankList = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  return (
    <Layout columns={1}>
      <Grid.Column>
        <Header as="h3">排行榜</Header>
        <Table basic unstackable textAlign="center" size="large">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>#</Table.HeaderCell>
              <Table.HeaderCell>用户名</Table.HeaderCell>
              <Table.HeaderCell>
                <Star />
              </Table.HeaderCell>
              <Table.HeaderCell>更新时间</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rankList.map(({ username, star, updatedAt }, rank) => (
              <Table.Row key={rank} active={user?.username === username}>
                <Table.Cell>{rank + 1}</Table.Cell>
                <Table.Cell>
                  <UserLink username={username} />
                </Table.Cell>
                <Table.Cell>
                  <span title={star.toString()}>{formatStar(star, 2)}</span>
                </Table.Cell>
                <Table.Cell>
                  <span title={formatDate(updatedAt)}>
                    {relativeDate(updatedAt)}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Grid.Column>
    </Layout>
  );
}
