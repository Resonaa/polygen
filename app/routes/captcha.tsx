import type { LoaderFunctionArgs } from "@remix-run/node";
import svgCaptcha from "svg-captcha";

import { createCaptchaSession } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const captcha = svgCaptcha.create({
    ignoreChars: "0o1iIlLO", color: true, noise: 2, height: 42, width: 100, fontSize: 45
  });
  return await createCaptchaSession(request, captcha.text, captcha.data);
}