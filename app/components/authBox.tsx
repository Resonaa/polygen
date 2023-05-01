import { Form as ReactForm, Link, useActionData, useSearchParams, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { useRef, useEffect } from "react";
import { Button, Form, Icon, Grid, Divider } from "semantic-ui-react";

import type { action } from "~/routes/register";

import Layout from "./layout";

export default function AuthBox({ type }: { type: "login" | "register" }) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const actionData = useActionData<typeof action>();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const repeatPasswordRef = useRef<HTMLInputElement>(null);

  const navigation = useNavigation();

  useEffect(() => {
    if (actionData?.username) {
      usernameRef.current?.focus();
    } else if (actionData?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.repeatPassword) {
      repeatPasswordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Layout columns={1}>
      <Grid.Column className="my-auto !flex justify-center">
        <Form as={ReactForm} size="large" className="max-sm:w-full bg-white p-8 m-auto" method="post"
              action={`/${type}`}>
          <Form.Field className="text-center">
            <img src="/images/polygen.png" alt="logo" />
          </Form.Field>

          <Form.Field className={clsx(actionData?.username && "error")}>
            <div className={clsx("ui left icon input", actionData?.username && "error")}>
              <input
                ref={usernameRef}
                required
                autoFocus
                name="username"
                type="username"
                autoComplete="nickname"
                placeholder="用户名"
              />
              <Icon name="user" />
            </div>
            {actionData?.username && (
              <div className="error-message">
                {actionData.username}
              </div>
            )}
          </Form.Field>

          <Form.Field className={clsx(actionData?.password && "error")}>
            <div className={clsx("ui left icon input", actionData?.password && "error")}>
              <input
                ref={passwordRef}
                required
                name="password"
                type="password"
                autoComplete={type === "login" ? "current-password" : "new-password"}
                placeholder="密码"
              />
              <Icon name="lock" />
            </div>
            {actionData?.password && (
              <div className="error-message">
                {actionData.password}
              </div>
            )}
          </Form.Field>

          {type === "register" &&
            <Form.Field className={clsx(actionData?.repeatPassword && "error")}>
              <div className={clsx("ui left icon input", actionData?.repeatPassword && "error")}>
                <input
                  ref={repeatPasswordRef}
                  required
                  name="repeatPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="再次输入密码"
                />
                <Icon name="lock" />
              </div>
              {actionData?.repeatPassword && (
                <div className="error-message">
                  {actionData.repeatPassword}
                </div>
              )}
            </Form.Field>
          }

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button fluid primary size="large" type="submit" loading={navigation.state === "submitting"}
                  disabled={navigation.state === "submitting"}>
            {type === "login" ? "登录" : "注册"}
          </Button>

          <div className="text-center">
            <Divider />
            <Form.Field className="text-base">
              {type === "login" ?
                <>
                  没有账号？
                  <Link to={`/register?redirectTo=${redirectTo}`} prefetch="intent">注册</Link>
                </>
                :
                <>
                  已有账号？
                  <Link to={`/login?redirectTo=${redirectTo}`} prefetch="intent">登录</Link>
                </>
              }
            </Form.Field>
          </div>
        </Form>
      </Grid.Column>
    </Layout>
  );
}
