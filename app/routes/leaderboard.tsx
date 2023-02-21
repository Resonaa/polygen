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
  return await requireAuthenticatedOptionalUser(request, Access.Basic);
}

export default function Leaderboard() {
  return (
    <Layout columns={1}>
      <iframe src="https://hexpansion.io/" title="hexpansion" className="w-full select-none" />
    </Layout>
  );
}