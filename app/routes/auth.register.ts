import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import type { TFunctionArg } from "~/i18n/i18next";
import { createUser, getUser } from "~/models/user.server";
import { createUserSession, verifyCaptcha } from "~/session.server";
import { validateRegisterFormData } from "~/validators/auth.server";

export function loader() {
  return redirect("/");
}

type AsTFunctionArg<T> = {
  [K in keyof T]: TFunctionArg;
};

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const res = validateRegisterFormData(data);

  if (res.success) {
    const { username, password, retypePassword, captcha } = res.data;

    if (!(await verifyCaptcha(request, captcha))) {
      return { captcha: "auth.captchaIncorrect" };
    }

    if (password !== retypePassword) {
      return { retypePassword: "auth.passwordsNotMatch" };
    }

    if (await getUser(username)) {
      return { username: "auth.usernameAlreadyExists" };
    }

    await createUser(username, password);

    return createUserSession(request, username);
  } else {
    return res.error as AsTFunctionArg<typeof res.error>;
  }
}
