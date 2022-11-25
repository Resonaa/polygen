import { Grid } from "semantic-ui-react";
import type { LoaderArgs } from "@remix-run/node";

import Layout from "~/components/layout";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";

export function meta() {
  return {
    title: "排行榜 - polygen"
  };
}

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.VisitWebsite);
}

export default function Leaderboard() {
  return (
    <Layout columns={1}>
      <Grid.Column className="text-center">
        <iframe title="generals.io" src="https://generals.io" className="w-full h-[110%]" />
      </Grid.Column>
    </Layout>
  );
}