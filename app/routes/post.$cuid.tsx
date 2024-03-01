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
import { useOptionalUser } from "~/hooks/loader";
import { getT } from "~/i18n/i18n";
import { createComment, getComments } from "~/models/comment.server";
import { getPost } from "~/models/post.server";
import { badRequest, notFound } from "~/reponses.server";
import { requireUser } from "~/session.server";
import {
  validateAddCommentFormData,
  validateGetPostParams
} from "~/validators/community.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const res = validateGetPostParams(params);

  if (!res.success) {
    throw badRequest;
  }

  const { cuid } = res.data;

  const post = await getPost(cuid);
  if (!post) {
    throw notFound;
  }

  const comments = await getComments(1, cuid);

  return json({ post, comments });
}

export const meta: MetaFunction<typeof loader> = ({ matches, data }) => {
  const t = getT(matches);
  return [
    {
      title: `${t("community.post-of", {
        username: data?.post.username
      })} - polygen`
    }
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const { username } = await requireUser(request, Access.Community);

  const data = await request.formData();
  const res = validateAddCommentFormData(data);

  if (res.success) {
    const { content, parentCuid } = res.data;
    const post = await getPost(parentCuid);

    if (!post) {
      return null;
    }

    await createComment(username, content, parentCuid, post.isPrivate);
  }

  return null;
}

export default function PostId() {
  const { post, comments } = useLoaderData<typeof loader>();
  const user = useOptionalUser();

  const parentCuid = post.cuid;

  return (
    <VStack w="100%" spacing={4}>
      <Post linked={false} {...post} />

      <Divider />

      {user ? <AddComment parentCuid={parentCuid} /> : null}

      <Comments comments={comments} parentCuid={parentCuid} />
    </VStack>
  );
}
