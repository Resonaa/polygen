import Layout from "~/components/layout";
import { Grid } from "semantic-ui-react";
import AdminMenu from "~/components/adminMenu";
import { Outlet } from "@remix-run/react";

export function meta() {
  return {
    title: "管理后台 - polygen"
  };
}

export default function Admin() {
  return (
    <Layout columns={2}>
      <Grid.Column width={4}>
        <AdminMenu />
      </Grid.Column>

      <Grid.Column width={12}>
        <Outlet />
      </Grid.Column>
    </Layout>
  );
}