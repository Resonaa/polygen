import { VStack } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import RoomList from "~/components/game/roomList";
import Layout from "~/components/layout/layout";
import { roomData } from "~/core/server/room";

export const meta: MetaFunction = () => [{ title: "大厅 - polygen" }];

export async function loader() {
  return json(Array.from(roomData.values()).map(room => room.export()));
}

export default function Index() {
  const rooms = useLoaderData<typeof loader>();

  return (
    <Layout>
      <VStack w="100%">
        <RoomList rooms={rooms} />
      </VStack>
    </Layout>
  );
}
