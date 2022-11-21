import { useRef, useEffect } from "react";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { Button, Form as SemanticForm, Icon, Grid } from "semantic-ui-react";

import logo from "../../public/images/polygen.png";
import Layout from "./layout";
import type { action } from "~/routes/register";

export default function AuthBox({ type }: { type: "login" | "register" }) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const actionData = useActionData<typeof action>();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const repeatPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.username) {
      usernameRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.repeatPassword) {
      repeatPasswordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Layout columns={1}>
      <Grid.Column className="my-auto !flex justify-center">
        <Form className="ui large form max-sm:w-full bg-white shadow-md p-8 m-auto rounded" method="post"
              action={`/${type}`}>
          <SemanticForm.Field>
            <img src={logo} alt="logo" className="mx-auto" />
          </SemanticForm.Field>

          <SemanticForm.Field className={actionData?.errors?.username ? "error" : ""}>
            <div className={`ui left icon input ${actionData?.errors?.username ? "error" : ""}`}>
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
            {actionData?.errors?.username && (
              <div className="pt-1 text-red-700" id="username-error">
                {actionData.errors.username}
              </div>
            )}
          </SemanticForm.Field>

          <SemanticForm.Field className={actionData?.errors?.password ? "error" : ""}>
            <div className={`ui left icon input ${actionData?.errors?.password ? "error" : ""}`}>
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
            {actionData?.errors?.password && (
              <div className="pt-1 text-red-700" id="password-error">
                {actionData.errors.password}
              </div>
            )}
          </SemanticForm.Field>

          {type === "register" &&
            <SemanticForm.Field className={actionData?.errors?.repeatPassword ? "error" : ""}>
              <div className={`ui left icon input ${actionData?.errors?.repeatPassword ? "error" : ""}`}>
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
              {actionData?.errors?.repeatPassword && (
                <div className="pt-1 text-red-700" id="repeatPassword-error">
                  {actionData.errors.repeatPassword}
                </div>
              )}
            </SemanticForm.Field>
          }

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button fluid primary size="large" type="submit">
            {type === "login" ? "登录" : "注册"}
          </Button>

          <div className="text-center">
            <hr className="h-px bg-slate-200 borderless my-3.5" />
            <SemanticForm.Field className="text-base">
              {type === "login" ?
                <>
                  没有账号？
                  <Link to="/register">注册</Link>
                </>
                :
                <>
                  已有账号？
                  <Link to="/login">登录</Link>
                </>
              }
            </SemanticForm.Field>
          </div>
        </Form>
      </Grid.Column>
    </Layout>
  );
}
