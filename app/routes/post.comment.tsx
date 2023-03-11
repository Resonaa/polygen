import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";
import { getComments } from "~/models/comment.server";

export async function loader({ request }: ActionArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.Basic);
}

export async function action({ request }: ActionArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);

  const data = await request.json();
  const parentId = data.parentId;
  const page = data.page;

  if (typeof parentId !== "number" || parentId <= 0)
    return json("说说ID不合法", { status: 400 });

  if (typeof page !== "number" || page <= 0)
    return json("页数不合法", { status: 400 });

  const comments = await getComments({ page, parentId });

  return json(comments);
}