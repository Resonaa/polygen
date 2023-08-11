import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { createUser, getUserWithoutPasswordByUsername } from "~/models/user.server";
import {
  createUserSession,
  removeCaptchaSession,
  verifyCaptcha
} from "~/session.server";
import { safeRedirect, validateCaptcha, validatePassword, validateUsername } from "~/validator.server";


export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");
  const repeatPassword = formData.get("repeatPassword");
  const captcha = formData.get("captcha");
  const redirectTo = safeRedirect(formData.get("redirectTo"));

  if (!validateCaptcha(captcha)) {
    return removeCaptchaSession(request, {
      username: null,
      password: null,
      repeatPassword: null,
      captcha: "验证码错误"
    });
  }

  if (!validateUsername(username)) {
    return removeCaptchaSession(request, {
      username: "用户名只能包含中英文、数字和_",
      password: null,
      repeatPassword: null,
      captcha: null
    });
  }

  if (!validatePassword(password)) {
    return removeCaptchaSession(request, {
      username: null,
      password: "密码长度应不小于6位",
      repeatPassword: null,
      captcha: null
    });
  }

  if (password !== repeatPassword) {
    return removeCaptchaSession(request, {
      username: null,
      password: null,
      repeatPassword: "两次输入的密码不一致",
      captcha: null
    });
  }

  if (!await verifyCaptcha(request, captcha)) {
    return removeCaptchaSession(request, {
      username: null,
      password: null,
      repeatPassword: null,
      captcha: "验证码错误"
    });
  }

  if (await getUserWithoutPasswordByUsername(username)) {
    return removeCaptchaSession(request, {
      username: "用户名已存在",
      password: null,
      repeatPassword: null,
      captcha: null
    });
  }

  await createUser(username, password);

  return createUserSession(request, username, redirectTo);
}
