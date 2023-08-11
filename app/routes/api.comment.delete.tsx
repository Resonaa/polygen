import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import Access from "~/access";
import { deleteComment, getComment } from "~/models/comment.server";
import { requireAuthenticatedUser } from "~/session.server";
import { validatePage } from "~/validator.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  const user = await requireAuthenticatedUser(request, Access.Community);

  const formData = await request.formData();
  const id = Number(formData.get("id"));

  if (!validatePage(id)) {
    return json("评论ID不合法", { status: 400 });
  }

  const comment = await getComment(id);
  if (!comment) {
    return json("评论不存在", { status: 400 });
  }

  if (user.username !== comment.username) {
    await requireAuthenticatedUser(request, Access.ManageCommunity);
  }

  await deleteComment(id);

  return json("删除成功");
}