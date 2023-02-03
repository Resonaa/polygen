import { Grid } from "semantic-ui-react";
import type { LoaderArgs } from "@remix-run/node";

import Layout from "~/components/layout";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";
import { useEffect } from "react";
import { catchTheCat } from "~/core/client/catchTheCat";

export function meta() {
  return {
    title: "排行榜 - polygen"
  };
}

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.Basic);
}

export default function Leaderboard() {
  useEffect(catchTheCat, []);

  return (
    <Layout columns={1}>
      <Grid.Column className="text-center">
        <div id="catch-the-cat" className="flex justify-center" />
      </Grid.Column>
    </Layout>
  );
}