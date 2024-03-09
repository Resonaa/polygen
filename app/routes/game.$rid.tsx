import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { ClientProvider } from "~/components/game/clientProvider";
import Ping from "~/components/game/ping";
import { getT } from "~/i18n/i18n";
import { badRequest } from "~/reponses.server";
import { validateGetRoomParams } from "~/validators/game.server";

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: t("nav.room") + " - polygen" }];
};

export function loader({ params }: LoaderFunctionArgs) {
  const res = validateGetRoomParams(params);

  if (!res.success) {
    throw badRequest;
  }

  const { rid } = res.data;

  return json(rid);
}

export default function Rid() {
  const rid = useLoaderData<typeof loader>();

  return (
    <ClientProvider>
      <Ping />
    </ClientProvider>
  );
}
