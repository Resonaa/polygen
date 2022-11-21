import type { SemanticICONS, SemanticWIDTHS } from "semantic-ui-react";
import { Button, Container, Dropdown, Grid, Header, Icon, Menu, Sidebar } from "semantic-ui-react";
import React, { useEffect } from "react";
import { Form, Link, NavLink } from "@remix-run/react";

import Footer from "./footer";
import { Access, useAuthorizedOptionalUser } from "~/utils";

function NavItem({
                   to,
                   text,
                   icon,
                   className
                 }: { to: string, text: string, icon: SemanticICONS, className?: string }) {
  return (
    <Menu.Item as={NavLink} className={className} to={to}>
      <Icon name={icon} />{text}
    </Menu.Item>
  );
}

export default function Layout({ columns, children }: { columns: SemanticWIDTHS, children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  const [top, setTop] = React.useState(true);
  const [slideUp, setSlideUp] = React.useState(false);
  const refButton = React.useRef<HTMLButtonElement>(null);

  const user = useAuthorizedOptionalUser(Access.VisitWebsite);

  useEffect(() => {
    let newScrollPosition = 0, lastScrollPosition = 0;

    const handleScroll = (_: any) => {
      lastScrollPosition = document.getElementsByClassName("pushable")[0].scrollTop;

      setTop(lastScrollPosition === 0);

      if (newScrollPosition < lastScrollPosition && lastScrollPosition > 100) {
        setSlideUp(true);
      } else if (newScrollPosition > lastScrollPosition) {
        setSlideUp(false);
      }

      newScrollPosition = lastScrollPosition;
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <>
      <Menu fixed="top" borderless
            className={`h-14 transform duration-300 ${slideUp ? "-translate-y-full" : "translate-y-0"}
            ${top || slideUp ? "!shadow-none" : "!shadow-lg"}`}>
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
                <Button as={Link} primary to="/register" className="!ml-7">注册</Button>
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

      <Sidebar.Pushable className="min-h-full">
        <Sidebar.Pusher dimmed={visible} className="overflow-hidden min-h-full flex flex-col">
          <Grid stackable container className="!mt-16 !mb-3 flex-1" columns={columns}>{children}</Grid>
          <Footer />
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </>
  );
}