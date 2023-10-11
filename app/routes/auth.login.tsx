import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { verifyLogin } from "~/models/user.server";
import { createUserSession } from "~/session.server";
import { validateLoginFormData } from "~/validators/auth.server";
import type { ErrorType } from "~/validators/utils.server";

export async function loader() {
  return redirect("/");
}

function loginError(data: ErrorType<typeof validateLoginFormData>) {
  return json(data, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const res = validateLoginFormData(data);

  if (res.success) {
    const { username, password } = res.data;

    if (!(await verifyLogin(username, password))) {
      return loginError({ username: "auth.username-or-password-incorrect" });
    }

    return createUserSession(request, username);
  } else {
    return loginError(res.error);
  }
}
