import Layout from "~/components/layout";
import { Grid, Menu } from "semantic-ui-react";
import { NavLink, Outlet } from "@remix-run/react";

export function meta() {
  return {
    title: "管理后台 - polygen"
  };
}

function AdminMenu() {
  function AdminItem({ id, name }: { id: string, name: string }) {
    return (
      <Menu.Item as={NavLink} to={id}>
        {name}
      </Menu.Item>
    );
  }

  return (
    <Menu vertical fluid size="large" className="!shadow-md">
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