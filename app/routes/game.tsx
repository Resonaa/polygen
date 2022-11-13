import { Grid } from "semantic-ui-react";
import Layout from "~/components/layout";
import { useEffect } from "react";

export default function Game() {
  useEffect(() => {
    // @ts-ignore
    const game = setTimeout(() => new CatchTheCatGame({
      w: 15,
      h: 15,
      r: 15,
      parent: "catch-the-cat",
      statusBarAlign: "center",
      credit: "polygen"
    }), process.env.NODE_ENV === "production" ? 300 : 700);

    return () => clearTimeout(game);
  }, []);

  return (
    <Layout columns={1} cur="game">
      <Grid.Column className="text-center">
        <script src="/js/phaser.min.js"></script>
        <script src="/js/catch-the-cat.min.js"></script>

        <div id="catch-the-cat"></div>
      </Grid.Column>
    </Layout>
  );
}