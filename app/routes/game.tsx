import { Grid } from "semantic-ui-react";
import { useEffect } from "react";
import type { LoaderArgs } from "@remix-run/node";

import Layout from "~/components/layout";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";

export function meta() {
  return {
    title: "游戏 - polygen"
  };
}

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.VisitWebsite);
}

export default function Game() {
  useEffect(() => {
    require("public/js/phaser.min.js");
    require("public/js/catch-the-cat.min.js");

    // @ts-ignore
    new CatchTheCatGame({
      w: 15,
      h: 15,
      r: 15,
      parent: "catch-the-cat",
      statusBarAlign: "center",
      credit: "polygen",
      backgroundColor: 0xffffff
    });
  }, []);

  return (
    <Layout columns={1}>
      <Grid.Column className="text-center">
        <div id="catch-the-cat"></div>
      </Grid.Column>
    </Layout>
  );
}