import { VStack } from "@chakra-ui/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import Ranks from "~/components/game/ranks";
import Layout from "~/components/layout/layout";
import { useRevalidationInterval } from "~/hooks/revalidator";
import { getT } from "~/i18next.server";
import { rankList } from "~/models/star.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await getT(request);
  const title = t("nav.leaderboard") + " - polygen";

  const ranks = await rankList();

  return json({ title, ranks });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.title }
];

export default function Leaderboard() {
  const { ranks } = useLoaderData<typeof loader>();

  useRevalidationInterval(60 * 1000);

  return (
    <Layout>
      <VStack w="100%">
        <Ranks ranks={ranks} />
      </VStack>
    </Layout>
  );
}
