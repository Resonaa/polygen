import { Grid } from "semantic-ui-react";
import Layout from "~/components/layout";

export function meta() {
  return {
    title: "排行榜 - polygen"
  };
}

export default function Leaderboard() {
  return (
    <Layout columns={1} cur="leaderboard">
      <Grid.Column className="text-center">
        <iframe title="generals.io" src="https://generals.io" className="w-full h-[110%]" />
      </Grid.Column>
    </Layout>
  );
}