import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import Access from "~/access";
import { getPosts } from "~/models/post.server";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { validatePage } from "~/validator.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);

  const formData = await request.formData();
  const page = Number(formData.get("page"));

  if (!validatePage(page)) {
    return json("页数不合法", { status: 400 });
  }

  return json(await getPosts(page));
}