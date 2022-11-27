import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getPost } from "~/models/post.server";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access } from "~/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAuthenticatedOptionalUser(request, Access.VisitWebsite);

  invariant(params.postId, "缺少postId");
  const id = Number(params.postId);

  const post = await getPost({ id });
  if (!post) {
    throw new Response("说说不存在", { status: 404 });
  }

  return json({ post });
}

export default function PostId() {
  return (
    <></>
  );
}