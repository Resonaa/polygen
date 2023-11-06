import { VStack } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import Ranks from "~/components/game/ranks";
import Layout from "~/components/layout/layout";
import { useRevalidationInterval } from "~/hooks/revalidator";
import { getT } from "~/i18n";
import { rankList } from "~/models/star.server";

export async function loader() {
  return json(await rankList());
}

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: t("nav.leaderboard") + " - polygen" }];
};

export default function Leaderboard() {
  const ranks = useLoaderData<typeof loader>();

  useRevalidationInterval(60 * 1000);

  return (
    <Layout>
      <VStack w="100%">
        <Ranks ranks={ranks} />
      </VStack>
    </Layout>
  );
}
