import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink, Outlet } from "@remix-run/react";
import { Grid, Menu, Segment } from "semantic-ui-react";

import Access from "~/access";
import Layout from "~/components/layout";
import { requireAuthenticatedOptionalUser } from "~/session.server";

export const meta: MetaFunction = () => [{ title: "设置 - polygen" }];

export async function loader({ request }: LoaderFunctionArgs) {
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
    <Menu vertical fluid tabular size="huge">
      <Menu.Item>
        游戏
        <Menu.Menu>
          <Setting id="controls" name="移动控制" />
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
        <Segment size="large" basic>
          <Outlet />
        </Segment>
      </Grid.Column>
    </Layout>
  );
}