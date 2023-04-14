import type { LoaderArgs, V2_MetaFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import parser from "socket.io-msgpack-parser";
import { useLoaderData } from "@remix-run/react";
import { Grid, Segment } from "semantic-ui-react";

import { requireAuthenticatedUser } from "~/session.server";
import { Chat } from "~/core/client/chat";
import { Access } from "~/utils";
import type { ClientSocket } from "~/core/types";
import { RoomInfo } from "~/core/client/roomInfo";
import { GamePanel } from "~/core/client/gamePanel";

import game from "~/styles/game.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: game }];

export const meta: V2_MetaFunction = () => [{ title: "游戏 - polygen" }];

export async function loader({ request, params }: LoaderArgs) {
  await requireAuthenticatedUser(request, Access.Gaming);
  return json(params.rid);
}

export default function Rid() {
  const [client, setClient] = useState<ClientSocket>();
  const rid = useLoaderData<typeof loader>();

  useEffect(() => {
    const client = io({ parser });
    setClient(client);
    return () => {
      client.close();
    };
  }, []);

  return (
    <Grid stackable container inverted className="!m-0 h-full" style={{ width: "100% !important" }}>
      <GamePanel client={client} rid={rid} />

      <Grid.Column width={4} className="!flex justify-between flex-col !p-0">
        <Segment inverted className="!pr-0">
          <RoomInfo client={client} rid={rid} />
        </Segment>

        <Segment inverted className="!pr-0 !pb-0 !pt-2 !pl-2.5">
          <Chat client={client} />
        </Segment>
      </Grid.Column>
    </Grid>
  );
}