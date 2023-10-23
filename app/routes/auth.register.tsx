import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { createUser, getUser } from "~/models/user.server";
import { createUserSession, verifyCaptcha } from "~/session.server";
import { validateRegisterFormData } from "~/validators/auth.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const res = validateRegisterFormData(data);

  if (res.success) {
    const { username, password, retypePassword, captcha } = res.data;

    if (!(await verifyCaptcha(request, captcha))) {
      return json({ captcha: "auth.captcha-incorrect" });
    }

    if (password !== retypePassword) {
      return json({ retypePassword: "auth.passwords-dont-match" });
    }

    if (await getUser(username)) {
      return json({ username: "auth.username-already-exists" });
    }

    await createUser(username, password);

    return createUserSession(request, username);
  } else {
    return json(res.error);
  }
}
