import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Outlet } from "@remix-run/react";
import { Grid, Menu } from "semantic-ui-react";

import Layout from "~/components/layout";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "设置 - polygen" }];

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.Settings);
}

function SettingsMenu() {
  function Setting({ id, name }: { id: string, name: string }) {
    return (
      <Menu.Item as={NavLink} to={id} prefetch="intent">
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

      <Menu.Item>
        活动
        <Menu.Menu>
          <Setting id="events" name="囚禁竞速挑战赛" />
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