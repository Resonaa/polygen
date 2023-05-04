import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { deleteComment } from "~/models/comment.server";
import {  requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";

export async function loader({ request }: ActionArgs) {
  return await requireAuthenticatedUser(request, Access.Community);
}

export async function action({ request }: ActionArgs) {
  const { username } = await requireAuthenticatedUser(request, Access.Community);

  const data = await request.json();
  const id = data.id;

  if (typeof id !== "number" || id <= 0) {
    return json("评论ID不合法", { status: 400 });
  }
  
  await deleteComment(username, id);

  return json("删除成功");
}