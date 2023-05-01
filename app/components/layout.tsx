import { Form, Link, NavLink, useLocation, useSearchParams } from "@remix-run/react";
import type { ReactNode } from "react";
import { useState, useRef } from "react";
import type { SemanticICONS, SemanticWIDTHS } from "semantic-ui-react";
import { Button, Container, Dropdown, Grid, Header, Icon, Menu, Sidebar } from "semantic-ui-react";

import { useOptionalUser } from "~/utils";

import Footer from "./footer";

function NavItem({
                   to,
                   text,
                   icon,
                   className
                 }: { to: string, text: string, icon: SemanticICONS, className?: string }) {
  return (
    <Menu.Item as={NavLink} className={className} to={to} prefetch="intent">
      <Icon name={icon} />{text}
    </Menu.Item>
  );
}

export default function Layout({ columns, children }: { columns: SemanticWIDTHS, children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const refButton = useRef<HTMLButtonElement>(null);
  let location = useLocation().pathname;
  const [searchParams] = useSearchParams();
  const user = useOptionalUser();

  if (location === "/login" || location === "/register") {
    location = searchParams.get("redirectTo") || "/";
  }

  return (
    <>
      <Menu fixed="top" borderless className="h-14">
        <Container>
          <Header as={Menu.Item} className="max-sm:!hidden">
            <span className="font-semibold text-2xl">polygen</span>
          </Header>

          <NavItem to="/" text="首页" icon="home" className="max-sm:!hidden" />
          <NavItem to="/game" text="游戏" icon="chess queen" className="max-sm:!hidden" />
          <NavItem to="/leaderboard" text="排行榜" icon="signal" className="max-sm:!hidden" />
          <NavItem to="/admin" text="管理后台" icon="tachometer alternate" className="max-sm:!hidden" />
          <Menu.Item className="sm:!hidden" onClick={() => setVisible(true)}>
            <Icon name="sidebar" />
          </Menu.Item>

          <Menu.Item position="right">
            {user ?
              <Dropdown item simple text={user.username}>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={`/user/${user.username}`}>
                    <Icon name="user" />主页
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">
                    <Icon name="cog" />设置
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Form action="/logout" method="post">
                    <button ref={refButton} type="submit" className="hidden" />
                    <input type="hidden" name="redirectTo" value={location} />

                    <Dropdown.Item as="a" onClick={() => refButton.current?.click()}>
                      <Icon name="sign out alternate" />登出
                    </Dropdown.Item>
                  </Form>
                </Dropdown.Menu>
              </Dropdown>
              : <>
                <Button as={Link} to={`/login?redirectTo=${location}`} prefetch="intent">登录</Button>
                <Button as={Link} primary to={`/register?redirectTo=${location}`} className="!ml-7"
                        prefetch="intent">注册</Button>
              </>
            }
          </Menu.Item>
        </Container>
      </Menu>

      <Sidebar as={Menu} animation="overlay" vertical onHide={() => setVisible(false)} visible={visible}>
        <NavItem to="/" text="首页" icon="home" />
        <NavItem to="/game" text="游戏" icon="chess queen" />
        <NavItem to="/leaderboard" text="排行榜" icon="signal" />
        <NavItem to="/admin" text="管理后台" icon="tachometer alternate" />
      </Sidebar>

      <Sidebar.Pushable className="min-h-full !overflow-visible">
        <Sidebar.Pusher dimmed={visible} className="min-h-full flex flex-col">
          <Grid stackable container className="!mt-16 !mb-3 flex-1" columns={columns}>{children}</Grid>
          <Footer />
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </>
  );
}