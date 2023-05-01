import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout, requireAuthenticatedUser } from "~/session.server";
import { Access, safeRedirect } from "~/utils";

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedUser(request, Access.Basic);

  const formData = await request.formData();
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  return logout(request, redirectTo);
}

export async function loader() {
  return redirect("/");
}
