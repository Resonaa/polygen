import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { createUserSession, requireAuthenticatedOptionalUser } from "~/session.server";
import { createUser, getUserByUsername } from "~/models/user.server";
import { Access, validatePassword, validateUsername, safeRedirect } from "~/utils";
import AuthBox from "../components/authBox";

export async function loader({ request }: LoaderArgs) {
  if (await requireAuthenticatedOptionalUser(request, Access.VisitWebsite))
    return redirect("/");

  return null;
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");
  const repeatPassword = formData.get("repeatPassword");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateUsername(username))
    return json(
      { username: "用户名为3~16位，仅包含中英文、数字和_", password: null, repeatPassword: null },
      { status: 400 }
    );

  if (!validatePassword(password))
    return json(
      { username: null, password: "密码长度应不小于6位", repeatPassword: null },
      { status: 400 }
    );

  if (password !== repeatPassword)
    return json(
      { username: null, password: null, repeatPassword: "两次输入的密码不一致" },
      { status: 400 }
    );

  if (await getUserByUsername(username))
    return json(
      { username: "用户名已存在", password: null, repeatPassword: null },
      { status: 400 }
    );

  await createUser(username, password);

  return createUserSession({ request, username, redirectTo });
}

export function meta() {
  return {
    title: "注册 - polygen"
  };
}

export default function Register() {
  return (
    <AuthBox type="register" />
  );
}
