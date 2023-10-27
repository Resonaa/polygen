import { VStack } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import RoomList from "~/components/game/roomList";
import Layout from "~/components/layout/layout";
import { roomData } from "~/core/server/room";
import { getT } from "~/i18next.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const rooms = Array.from(roomData.values()).map(room => room.export());
  const t = await getT(request);
  const title = t("nav.game") + " - polygen";

  return json({ rooms, title });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.title }
];

export default function Index() {
  const { rooms } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <VStack w="100%">
        <RoomList rooms={rooms} />
      </VStack>
    </Layout>
  );
}
