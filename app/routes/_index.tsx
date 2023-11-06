import { Divider, VStack } from "@chakra-ui/react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import Access from "~/access";
import AddPost from "~/components/community/addPost";
import Announcements from "~/components/community/announcements";
import Countdowns from "~/components/community/countdowns";
import Posts from "~/components/community/posts";
import RecentComments from "~/components/community/recentComments";
import { useOptionalUser } from "~/hooks/loader";
import { useRevalidationInterval } from "~/hooks/revalidator";
import { getT } from "~/i18n";
import { getAnnouncements } from "~/models/announcement.server";
import { getComments } from "~/models/comment.server";
import { createPost, getPosts } from "~/models/post.server";
import { requireUser } from "~/session.server";
import { validateAddPostFormData } from "~/validators/community.server";

import Layout from "../components/layout/layout";

export async function loader() {
  const announcements = await getAnnouncements();
  const posts = await getPosts(1);
  const recentComments = await getComments(1);

  return json({ announcements, posts, recentComments });
}

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: `${t("nav.home")} - polygen` }];
};

export async function action({ request }: ActionFunctionArgs) {
  const { username } = await requireUser(request, Access.Community);

  const data = await request.formData();
  const res = validateAddPostFormData(data);

  if (res.success) {
    const { content } = res.data;

    await createPost(username, content);
  }

  return null;
}

export default function Index() {
  const { announcements, posts, recentComments } =
    useLoaderData<typeof loader>();

  const user = useOptionalUser();

  useRevalidationInterval(1000 * 60);

  return (
    <Layout>
      <VStack w={{ base: "100%", md: "75%" }} spacing={4}>
        {user ? <AddPost /> : null}

        <Posts posts={posts} />
      </VStack>

      <VStack w={{ base: "100%", md: "25%" }} spacing={4}>
        <Announcements announcements={announcements} />
        <Divider />
        <Countdowns />
        <Divider />
        <RecentComments comments={recentComments} />
      </VStack>
    </Layout>
  );
}
