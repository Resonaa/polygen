import { Grid, Menu } from "semantic-ui-react";
import { NavLink, Outlet } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";

import Layout from "~/components/layout";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";

export function meta() {
  return {
    title: "设置 - polygen"
  };
}

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.Settings);
}

function SettingsMenu() {
  function Setting({ id, name }: { id: string, name: string }) {
    return (
      <Menu.Item as={NavLink} to={id}>
        {name}
      </Menu.Item>
    );
  }

  return (
    <Menu vertical fluid tabular size="large">
      <Menu.Item>
        游戏
        <Menu.Menu>
          <Setting id="keys" name="键位设置" />
          <Setting id="colors" name="配色方案" />
        </Menu.Menu>
      </Menu.Item>
    </Menu>
  );
}

export default function Settings() {
  return (
    <Layout columns={2}>
      <Grid.Column width={3}>
        <SettingsMenu />
      </Grid.Column>

      <Grid.Column width={13}>
        <Outlet />
      </Grid.Column>
    </Layout>
  );
}