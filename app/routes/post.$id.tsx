import { Divider, VStack } from "@chakra-ui/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import Access from "~/access";
import AddComment from "~/components/community/addComment";
import Comments from "~/components/community/comments";
import Post from "~/components/community/post";
import Layout from "~/components/layout/layout";
import { getT } from "~/i18next.server";
import { createComment, getComments } from "~/models/comment.server";
import { getPost } from "~/models/post.server";
import { badRequest, notFound } from "~/reponses.server";
import { requireUser } from "~/session.server";
import { useOptionalUser } from "~/utils";
import {
  validateAddCommentFormData,
  validateGetPostParams
} from "~/validators/community.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const t = await getT(request);

  const res = validateGetPostParams(params);

  if (!res.success) {
    throw badRequest;
  }

  const { id } = res.data;

  const post = await getPost(id);
  if (!post) {
    throw notFound;
  }

  const comments = await getComments(1, id);

  const title = `${t("community.post-of", {
    username: post.username
  })} - polygen`;

  return json({ post, comments, title });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.title }
];

export async function action({ request }: ActionFunctionArgs) {
  const { username } = await requireUser(request, Access.Community);

  const data = await request.formData();
  const res = validateAddCommentFormData(data);

  if (res.success) {
    const { content, parentId } = res.data;
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
      <VStack w="100%" spacing={4}>
        <Post linked={false} {...post} />

        <Divider />

        {user && <AddComment parentId={parentId} />}

        <Comments comments={comments} parentId={parentId} />
      </VStack>
    </Layout>
  );
}
