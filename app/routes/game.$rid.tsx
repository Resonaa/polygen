import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Segment } from "semantic-ui-react";
import { io } from "socket.io-client";

import Access from "~/access";
import GamePanel from "~/components/game/gamePanel";
import { Chat } from "~/core/client/chat";
import { RoomInfo } from "~/core/client/roomInfo";
import { Turns } from "~/core/client/turns";
import type { ClientSocket } from "~/core/types";
import { requireAuthenticatedUser } from "~/session.server";

export const meta: MetaFunction = () => [{ title: "游戏 - polygen" }];

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuthenticatedUser(request, Access.Gaming);
  return json(params.rid);
}

export default function Rid() {
  const [client, setClient] = useState<ClientSocket>();
  const rid = useLoaderData<typeof loader>();

  useEffect(() => {
    const client = io({ transports: ["websocket"] });
    setClient(client);
    return () => {
      client.close();
    };
  }, []);

  return (
    <>
      <GamePanel client={client} rid={rid} />

      <div className="absolute left-0 top-0 select-none">
        <Turns client={client} />
      </div>

      <div className="absolute right-0 top-0 sm:max-w-[320px]">
        <Segment inverted className="!p-0" size="large">
          <RoomInfo client={client} rid={rid} />
        </Segment>
      </div>

      <div className="absolute right-0 bottom-0 sm:w-[320px] max-w-[320px] max-sm:w-full">
        <Segment inverted className="!pr-0 !pb-0 !pt-2 !pl-2.5">
          <Chat client={client} />
        </Segment>
      </div>
    </>
  );
}
