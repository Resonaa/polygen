import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import Access from "~/access";
import { getPostsByUsername } from "~/models/post.server";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { validatePage, validateUsername } from "~/validator.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);

  const formData = await request.formData();
  const username = formData.get("username");
  const page = Number(formData.get("page"));

  if (!validateUsername(username)) {
    return json("用户名不合法", { status: 400 });
  }

  if (!validatePage(page)) {
    return json("页数不合法", { status: 400 });
  }

  return json(await getPostsByUsername(username, page));
}