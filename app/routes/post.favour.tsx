import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { sendFavour } from "~/models/post.server";
import { requireAuthenticatedOptionalUser, requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";

export async function loader({ request }: ActionArgs) {
  return await requireAuthenticatedOptionalUser(request, Access.Basic);
}

export async function action({ request }: ActionArgs) {
  const { username } = await requireAuthenticatedUser(request, Access.Basic);

  const data = await request.json();
  const id = data.id;

  if (typeof id !== "number" || id <= 0)
    return json("说说ID不合法", { status: 400 });

  await sendFavour(username, id);

  return json("点赞成功");
}