import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/session.server";
import { safeRedirect } from "~/validator.server";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const redirectTo = safeRedirect(formData.get("redirectTo"));

  return logout(request, redirectTo);
}

export async function loader() {
  return redirect("/");
}
