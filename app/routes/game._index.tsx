import { Grid, Header, Table, Form, Button } from "semantic-ui-react";
import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState, Fragment } from "react";
import clsx from "clsx";

import Layout from "~/components/layout";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";
import { UserLink } from "~/components/community";
import type { Player } from "~/core/server/player";
import { Room, roomData } from "~/core/server/room";

export const meta: V2_MetaFunction = () => {
  return [{ title: "大厅 - polygen" }];
};

export async function loader({ request }: LoaderArgs) {
  const user = await requireAuthenticatedOptionalUser(request, Access.Basic);

  let rooms = roomData;
  if (rooms.size === 0) {
    rooms.set("161", new Room("161"));
  }

  return json({ rooms: Array.from(rooms.values()), user });
}

function PlayerListString({ players }: { players: Player[] }) {
  return (
    <>
      {players.length === 0 ? "0玩家" : `${players.length}玩家: `}
      {players.map(({ username }, index) => (
        <Fragment key={index}>
          <UserLink username={username} />
          {index !== players.length - 1 && ", "}
        </Fragment>
      ))}
    </>
  );
}

export default function Index() {
  const { rooms, user } = useLoaderData<typeof loader>();

  const [id, setId] = useState("");

  return (
    <Layout columns={2}>
      <Grid.Column width={13}>
        <Header as="h3">加入房间</Header>

        <Table celled selectable unstackable>
          <Table.Header>
            <Table.Row>
              {["名称", "模式", "地图", "玩家"].map(s => <Table.HeaderCell content={s} key={s} />)}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rooms.map(room => (
              <Table.Row key={room.id} title={user ? "点击加入" : "登录后加入"} onClick={() =>
                user && window.open("/game/" + encodeURIComponent(room.id))
              } className={clsx(user && "cursor-pointer", "room-" + (room.ongoing ? "ongoing" : "ready"))}>
                <Table.Cell width={3}>{room.id}</Table.Cell>
                <Table.Cell width={2}>{room.mode}</Table.Cell>
                <Table.Cell width={2}>{room.map}</Table.Cell>
                <Table.Cell width={9}><PlayerListString players={room.players} /></Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Grid.Column>

      <Grid.Column width={3}>
        <Header as="h3">创建房间</Header>

        {user ? (
          <Form>
            <Form.Input label="名称" placeholder="名称" type="text" onChange={(_, { value }) => setId(value)} />

            <Button primary onClick={() =>
              id.trim() && window.open("/game/" + id.trim())
            }>创建房间</Button>
          </Form>
        ) : (
          <>
            请<Link to="/login" prefetch="intent">登录</Link>后加入或创建房间
          </>
        )}
      </Grid.Column>
    </Layout>
  );
}