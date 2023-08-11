import { VStack } from "@chakra-ui/react";
import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import Access from "~/access";
import AddPost from "~/components/community/addPost";
import Announcements from "~/components/community/announcements";
import Countdowns from "~/components/community/countdowns";
import Posts from "~/components/community/posts";
import RecentComments from "~/components/community/recentComments";
import { getAnnouncements } from "~/models/announcement.server";
import { getComments } from "~/models/comment.server";
import { createPost, getPosts } from "~/models/post.server";
import { requireAuthenticatedUser } from "~/session.server";
import { useOptionalUser } from "~/utils";
import { validatePostContent } from "~/validator.server";

import Layout from "../components/layout/layout";

export const meta: V2_MetaFunction = () => [{ title: "首页 - polygen" }];

export async function loader() {
  const announcements = await getAnnouncements();
  const posts = await getPosts(1);
  const recentComments = await getComments(1);

  return json({ announcements, posts, recentComments });
}

export async function action({ request }: ActionArgs) {
  const { username } = await requireAuthenticatedUser(request, Access.Community);

  const formData = await request.formData();
  const content = formData.get("content");

  if (validatePostContent(content)) {
    await createPost(username, content);
  }

  return null;
}

export default function Index() {
  const { announcements, posts, recentComments } = useLoaderData<typeof loader>();

  const user = useOptionalUser();

  return (
    <Layout>
      <VStack w={{ base: "100%", md: "75% " }}>
        {user && <AddPost />}

        <Posts posts={posts} />
      </VStack>

      <VStack w={{ base: "100%", md: "25% " }} spacing={4}>
        <Announcements announcements={announcements} />

        <Countdowns />
        
        <RecentComments comments={recentComments} />
      </VStack>
    </Layout>
  );
}
