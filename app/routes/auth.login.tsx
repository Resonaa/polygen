import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { safeRedirect, validatePassword, validateUsername } from "~/validator.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"));

  if (!validateUsername(username)) {
    return json({ username: "用户名只能包含中英文、数字和_" }, { status: 400 });
  }

  if (!validatePassword(password)) {
    return json({ password: "密码长度应不小于6位" }, { status: 400 });
  }

  const user = await verifyLogin(username, password);

  if (!user) {
    return json({ username: "用户名或密码错误" }, { status: 400 });
  }

  return createUserSession(request, username, redirectTo);
}
