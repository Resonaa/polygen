import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { validateLoginFormData } from "~/validators/auth.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const res = validateLoginFormData(data);

  if (res.success) {
    const { username, password } = res.data;

    if (!(await verifyLogin(username, password))) {
      return json({ username: "auth.username-or-password-incorrect" });
    }

    return createUserSession(request, username);
  } else {
    return json(res.error);
  }
}
