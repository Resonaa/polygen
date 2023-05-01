import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { NavLink, Outlet } from "@remix-run/react";
import { Grid, Menu } from "semantic-ui-react";

import Layout from "~/components/layout";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "管理后台 - polygen" }];

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.Basic);
}

function AdminMenu() {
  function AdminItem({ id, name }: { id: string, name: string }) {
    return (
      <Menu.Item as={NavLink} to={id} prefetch="intent">
        {name}
      </Menu.Item>
    );
  }

  return (
    <Menu vertical fluid tabular size="large">
      <Menu.Item>
        用户
        <Menu.Menu>
          <AdminItem id="userData" name="数据管理" />
          <AdminItem id="access" name="权限管理" />
        </Menu.Menu>
      </Menu.Item>

      <Menu.Item>
        社区
        <Menu.Menu>
          <AdminItem id="post" name="说说管理" />
          <AdminItem id="announcement" name="公告管理" />
        </Menu.Menu>
      </Menu.Item>

      <Menu.Item>
        游戏
        <Menu.Menu>
          <AdminItem id="room" name="房间管理" />
        </Menu.Menu>
      </Menu.Item>

      <Menu.Item>
        高级
        <Menu.Menu>
          <AdminItem id="server" name="服务器管理" />
          <AdminItem id="db" name="数据库管理" />
        </Menu.Menu>
      </Menu.Item>
    </Menu>
  );
}

export default function Admin() {
  return (
    <Layout columns={2}>
      <Grid.Column width={3}>
        <AdminMenu />
      </Grid.Column>

      <Grid.Column width={13}>
        <Outlet />
      </Grid.Column>
    </Layout>
  );
}