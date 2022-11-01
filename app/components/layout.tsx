import { Button, Container, Dropdown, Header, Icon, Menu, Sidebar } from "semantic-ui-react";
import React, { useEffect } from "react";
import { Form, Link } from "@remix-run/react";

import Footer from "./footer";
import { useOptionalUser } from "~/utils";

export default function Layout({ type, cur, children }: { type: string, cur: string, children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  const [slideUp, setSlideUp] = React.useState(false);
  const refButton = React.useRef<HTMLButtonElement>(null);

  const user = useOptionalUser();

  useEffect(() => {
    let newScrollPosition = 0, lastScrollPosition = 0;

    const handleScroll = (_: any) => {
      lastScrollPosition = window.scrollY;

      if (newScrollPosition < lastScrollPosition && lastScrollPosition > 80) {
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
      <Menu fixed="top" borderless className={`h-14 transform duration-300 ${slideUp ? "-translate-y-full" : "translate-y-0"}`}>
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

      <div className={`${cur !== "auth" ? "!h-auto min-h-full" : ""} pushable`}>
        <Sidebar.Pusher dimmed={visible} className="overflow-hidden min-h-full flex flex-col">
          {type === "text" ?
            <Container text
                       className={`${cur !== "auth" ? "mt-20 mb-12" : "max-sm:mt-20"} flex-1 !flex justify-center`}>{children}</Container>
            :
            <Container stackable grid className="m-12 flex-1">{children}</Container>
          }
        </Sidebar.Pusher>
      </div>

      <Footer />
    </>
  );
}