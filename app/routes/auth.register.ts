import type { ActionFunctionArgs, TypedResponse } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import type { TFunctionArg } from "~/i18n/i18next";
import { createUser, getUser } from "~/models/user.server";
import { createUserSession, verifyCaptcha } from "~/session.server";
import { validateRegisterFormData } from "~/validators/auth.server";
import type { ErrorType } from "~/validators/utils.server";

export function loader() {
  return redirect("/");
}

type AsTFunctionArg<T> = {
  [K in keyof T]: TFunctionArg;
};

type R = Promise<
  TypedResponse<AsTFunctionArg<ErrorType<typeof validateRegisterFormData>>>
>;

export async function action({ request }: ActionFunctionArgs): R {
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
    return json(res.error as AsTFunctionArg<typeof res.error>);
  }
}
