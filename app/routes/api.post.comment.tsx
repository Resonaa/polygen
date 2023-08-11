import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import Access from "~/access";
import { getComments } from "~/models/comment.server";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { validatePage } from "~/validator.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);

  const formData = await request.formData();
  const parentId = Number(formData.get("parentId"));
  const page = Number(formData.get("page"));

  if (!validatePage(parentId)) {
    return json("说说ID不合法", { status: 400 });
  }

  if (!validatePage(page)) {
    return json("页数不合法", { status: 400 });
  }

  const comments = await getComments(page, parentId);

  return json(comments);
}