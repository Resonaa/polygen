import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { createUserSession, requireAuthenticatedOptionalUser } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { Access, safeRedirect, validatePassword, validateUsername } from "~/utils";
import AuthBox from "../components/authBox";

export async function loader({ request }: LoaderArgs) {
  if (await requireAuthenticatedOptionalUser(request, Access.Basic))
    return redirect("/");

  return null;
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateUsername(username))
    return json({ username: "用户名为3~16位，仅包含中英文、数字和_" }, { status: 400 });

  if (!validatePassword(password))
    return json({ password: "密码长度应不小于6位" }, { status: 400 });

  const user = await verifyLogin(username, password);

  if (!user)
    return json({ username: "用户名或密码错误" }, { status: 400 });

  return createUserSession(request, username, redirectTo);
}

export const meta: V2_MetaFunction = () => [{ title: "登录 - polygen" }];

export default function Login() {
  return (
    <AuthBox type="login" />
  );
}
