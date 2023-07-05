import type { LoaderArgs, V2_MetaFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Segment } from "semantic-ui-react";
import { io } from "socket.io-client";

import { Chat } from "~/core/client/chat";
import { GamePanel } from "~/core/client/gamePanel";
import { RoomInfo } from "~/core/client/roomInfo";
import { Turns } from "~/core/client/turns";
import type { ClientSocket } from "~/core/types";
import { requireAuthenticatedUser } from "~/session.server";
import game from "~/styles/game.css";
import { Access } from "~/utils";

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
    const client = io();
    setClient(client);
    return () => {
      client.close();
    };
  }, []);

  return (
    <>
      <div className="h-full w-full">
        <GamePanel client={client} rid={rid} />
      </div>

      <div
        className="absolute left-0 top-0 select-none">
        <Turns client={client} />
      </div>

      <div
        className="absolute right-0 top-0 sm:max-w-[320px]">
        <Segment inverted className="!pr-0 !pt-1 !pb-0 !pl-0">
          <RoomInfo client={client} rid={rid} />
        </Segment>
      </div>

      <div
        className="absolute right-0 bottom-0 sm:w-[320px] max-w-[320px] max-sm:w-full">
        <Segment inverted className="!pr-0 !pb-0 !pt-2 !pl-2.5">
          <Chat client={client} />
        </Segment>
      </div>
    </>
  );
}