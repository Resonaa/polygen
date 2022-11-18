import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import * as React from "react";

import { createUserSession, getUsername } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { safeRedirect, validatePassword, validateUsername } from "~/utils";
import AuthBox from "../components/authBox";

export async function loader({ request }: LoaderArgs) {
  const username = await getUsername(request);
  if (username) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateUsername(username)) {
    return json(
      { errors: { username: "用户名为3~16位，仅包含中英文、数字和_", password: null } },
      { status: 400 }
    );
  }

  if (!validatePassword(password)) {
    return json(
      { errors: { username: null, password: "密码长度应不小于6位" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(username, password);

  if (!user) {
    return json(
      { errors: { username: "用户名或密码错误", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    username: user.username,
    redirectTo
  });
}

export function meta() {
  return {
    title: "登录 - polygen"
  };
}

export default function Login() {
  return (
    <AuthBox type="login" />
  );
}
