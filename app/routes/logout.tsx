import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout, requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedUser(request, Access.VisitWebsite);

  return logout(request);
}

export async function loader() {
  return redirect("/");
}
