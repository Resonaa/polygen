import { Button, Container, Dropdown, Header, Icon, Menu, Sidebar } from "semantic-ui-react";
import React from "react";
import { Form, Link } from "@remix-run/react";

import Footer from "./footer";
import { useOptionalUser } from "~/utils";

export default function Layout({ type, cur, children }: { type: string, cur: string, children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  const user = useOptionalUser();

  const refButton = React.useRef<HTMLButtonElement>(null);

  return (
    <Sidebar.Pushable>
      <Sidebar as={Menu} animation="overlay" inverted vertical onHide={() => setVisible(false)} visible={visible}>
        <Menu.Item as={Link} to="/" className={cur === "home" ? "active" : ""}>
          主页
        </Menu.Item>
        <Menu.Item as={"a"} className={cur === "game" ? "active" : ""}>
          游戏
        </Menu.Item>
        <Menu.Item as={"a"} className={cur === "leaderboard" ? "active" : ""}>
          排行榜
        </Menu.Item>
        <Menu.Item as={"a"} className={cur === "webadmin" ? "active" : ""}>
          管理后台
        </Menu.Item>
      </Sidebar>

      <Sidebar.Pusher dimmed={visible} className="overflow-hidden min-h-full flex flex-col">
        <Menu fixed="top" borderless className="h-14">
          <Container>
            <Header as={Menu.Item} className="max-sm:!hidden">
              <span className="font-semibold text-2xl">polygen</span>
            </Header>

            <Menu.Item as={Link} className={`max-sm:!hidden ${cur === "home" ? "active" : ""}`} to="/">
              <Icon name="home" />首页
            </Menu.Item>
            <Menu.Item as={"a"} className={`max-sm:!hidden ${cur === "game" ? "active" : ""}`}>
              <Icon name="chess queen" />游戏
            </Menu.Item>
            <Menu.Item as={"a"} className={`max-sm:!hidden ${cur === "leaderboard" ? "active" : ""}`}>
              <Icon name="signal" />排行榜
            </Menu.Item>
            <Menu.Item as={"a"} className={`max-sm:!hidden ${cur === "webadmin" ? "active" : ""}`}>
              <Icon name="tachometer alternate" />管理后台
            </Menu.Item>

            <Menu.Item className="sm:!hidden" onClick={() => setVisible(true)}>
              <Icon name="sidebar" />
            </Menu.Item>

            <Menu.Item position="right">
              {user ?
                <Dropdown item simple text={user.username}>
                  <Dropdown.Menu>
                    <Dropdown.Item as={"a"}>
                      <Icon name="user" />主页
                    </Dropdown.Item>
                    <Dropdown.Item as={"a"}>
                      <Icon name="cog" />设置
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Form action="/logout" method="post">
                      <button ref={refButton} type="submit" className="hidden" />

                      <Dropdown.Item as="a" onClick={() => refButton.current?.click()}>
                        <Icon name="sign out alternate" />登出
                      </Dropdown.Item>
                    </Form>
                  </Dropdown.Menu>
                </Dropdown>
                : <>
                  <Button as={Link} to="/login">登录</Button>
                  <Button as={Link} primary to="/register" className="!ml-6">注册</Button>
                </>
              }
            </Menu.Item>
          </Container>
        </Menu>

        {type === "text" ?
          <Container text className="mt-20 mb-12 flex-1 !flex justify-center">{children}</Container>
          :
          <Container stackable grid className="m-12 flex-1">{children}</Container>
        }
        <Footer />
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}