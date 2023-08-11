import { Divider, VStack } from "@chakra-ui/react";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import Access from "~/access";
import AddComment from "~/components/community/addComment";
import Comments from "~/components/community/comments";
import Post from "~/components/community/post";
import Layout from "~/components/layout/layout";
import { createComment, getComments } from "~/models/comment.server";
import { getPost } from "~/models/post.server";
import { requireAuthenticatedUser } from "~/session.server";
import { useOptionalUser } from "~/utils";
import { validateCommentContent, validatePage } from "~/validator.server";

export async function loader({ params }: LoaderArgs) {
  const id = Number(params.postId);
  if (!validatePage(id)) {
    throw new Response("请求无效", { status: 400, statusText: "Bad Request" });
  }

  const post = await getPost(id);
  if (!post) {
    throw new Response("说说不存在", { status: 404, statusText: "Not Found" });
  }

  const comments = await getComments(1, id);

  return json({ post, comments });
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [{ title: data ? `${data.post.username}的说说 - polygen` : "错误 - polygen" }];

export async function action({ request }: ActionArgs) {
  const { username } = await requireAuthenticatedUser(request, Access.Community);

  const formData = await request.formData();
  const content = formData.get("content");
  const parentId = Number(formData.get("parentId"));

  if (validatePage(parentId) && validateCommentContent(content)) {
    await createComment(username, content, parentId);
  }

  return null;
}

export default function PostId() {
  const { post, comments } = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  const parentId = post.id;

  return (
    <Layout>
      <VStack w="100%">
        <Post linked={false} {...post} />

        <Divider />

        {user && <AddComment parentId={parentId} />}

        <Comments comments={comments} parentId={parentId} />
      </VStack>
    </Layout>
  );
}