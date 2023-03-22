import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import parser from "socket.io-msgpack-parser";
import { useLoaderData } from "@remix-run/react";
import { Grid, Segment } from "semantic-ui-react";

import { requireAuthenticatedUser } from "~/session.server";
import { registerClientSocket } from "~/core/client";
import { Chat } from "~/core/client/chat";
import { Access } from "~/utils";
import type { ClientSocket } from "~/core/types";
import { GamePanel } from "~/core/client/gamePanel";

import game from "~/styles/game.css";

export function links() {
  return [{ rel: "stylesheet", href: game }];
}

export function meta() {
  return { title: "游戏 - polygen" };
}

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

  useEffect(() => {
    if (!client) return;
    registerClientSocket(client, rid);
  }, [rid, client]);

  return (
    <Grid stackable container inverted className="!m-0 h-full" style={{ width: "100% !important" }}>
      <canvas className="w-full h-full absolute !px-0" />

      <Grid.Column width={12} className="h-full !p-0" />

      <Grid.Column width={4} className="!flex justify-between flex-col !p-0">
        <Segment inverted className="!pr-0">
          <GamePanel client={client} />
        </Segment>

        <Segment inverted className="!pr-0 !pb-0 !pt-2">
          <Chat client={client} />
        </Segment>
      </Grid.Column>
    </Grid>
  );
}