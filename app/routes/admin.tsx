import Layout from "~/components/layout";
import { Grid } from "semantic-ui-react";

export default function Admin() {
  return (
    <Layout columns={2} cur="admin">
      <Grid.Column>
        l
      </Grid.Column>

      <Grid.Column>
        r
      </Grid.Column>
    </Layout>
  );
}