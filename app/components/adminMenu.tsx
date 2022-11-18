import { Menu } from "semantic-ui-react";
import { NavLink } from "@remix-run/react";

export default function AdminMenu() {
  function AdminItem({ id, name }: { id: string, name: string }) {
    return (
      <Menu.Item as={NavLink} to={id}>
        {name}
      </Menu.Item>
    );
  }

  return (
    <Menu vertical size="large" className="!shadow-md !w-auto">
      <Menu.Item>
        用户
        <Menu.Menu>
          <AdminItem id="userList" name="用户列表" />
          <AdminItem id="access" name="权限管理" />
        </Menu.Menu>
      </Menu.Item>
    </Menu>
  );
}