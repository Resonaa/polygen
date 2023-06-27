import type { LoaderArgs } from "@remix-run/node";
import svgCaptcha from "svg-captcha";

import { createCaptchaSession, requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";

export async function loader({ request }: LoaderArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);
  const captcha = svgCaptcha.create({
    ignoreChars: "0o1iIlLO", noise: 2, height: 42, width: 100, fontSize: 45
  });
  return await createCaptchaSession(request, captcha.text, captcha.data);
}