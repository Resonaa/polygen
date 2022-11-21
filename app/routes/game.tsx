import { Grid } from "semantic-ui-react";
import Layout from "~/components/layout";
import { useEffect } from "react";

export function meta() {
  return {
    title: "游戏 - polygen"
  };
}

export default function Game() {
  useEffect(() => {
    require("public/js/phaser.min.js");
    require("public/js/catch-the-cat.min.js");

    // @ts-ignore
    const game = setTimeout(() => new CatchTheCatGame({
      w: 15,
      h: 15,
      r: 15,
      parent: "catch-the-cat",
      statusBarAlign: "center",
      credit: "polygen",
      backgroundColor: 0xf8f9fa
    }), process.env.NODE_ENV === "production" ? 0 : 700);

    return () => clearTimeout(game);
  }, []);

  return (
    <Layout columns={1}>
      <Grid.Column className="text-center">
        <div id="catch-the-cat"></div>
      </Grid.Column>
    </Layout>
  );
}