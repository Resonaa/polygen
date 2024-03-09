import { VStack } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import RoomList from "~/components/game/roomList";
import { Room } from "~/core/server/room";
import { useRevalidationInterval } from "~/hooks/revalidator";
import { getT } from "~/i18n/i18n";

export function loader() {
  const rooms = [new Room("161").export()];

  return json(rooms);
}

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: t("nav.game") + " - polygen" }];
};

export default function Index() {
  const rooms = useLoaderData<typeof loader>();

  useRevalidationInterval(5000);

  return (
    <VStack w="100%">
      <RoomList rooms={rooms} />
    </VStack>
  );
}
