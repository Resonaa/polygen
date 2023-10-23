import { z } from "zod";

import { safeParseAndFlatten } from "./utils.server";

export const usernameSchema = z
  .string()
  .min(3)
  .max(18)
  .regex(
    /^[\u4e00-\u9fa5a-zA-Z0-9_\-\\!@$%^&*()=+[\]{}|:;'",.<>`~ ]+$/,
    "auth.username-invalid-chars"
  )
  .regex(/^[^ ].*[^ ]$/, "auth.username-starts-or-ends-with-space")
  .refine(
    username => !/ {2,}/.test(username),
    "auth.username-successive-spaces"
  );

const passwordSchema = z.string().min(6);

const captchaSchema = z.string().length(4);

const loginFormSchema = z.object({
  username: usernameSchema,
  password: passwordSchema
});

const registerFormSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  retypePassword: passwordSchema,
  captcha: captchaSchema
});

export function validateLoginFormData(data: FormData) {
  return safeParseAndFlatten(loginFormSchema, data);
}

export function validateRegisterFormData(data: FormData) {
  return safeParseAndFlatten(registerFormSchema, data);
}
