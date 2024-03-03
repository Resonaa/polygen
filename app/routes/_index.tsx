import { Divider, VStack } from "@chakra-ui/react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import Access, { access } from "~/access";
import AddPost from "~/components/community/addPost";
import Announcements from "~/components/community/announcements";
import Countdowns from "~/components/community/countdowns";
import Posts from "~/components/community/posts";
import RecentComments from "~/components/community/recentComments";
import Module from "~/components/layout/module";
import { useOptionalUser } from "~/hooks/loader";
import { getT } from "~/i18n/i18n";
import { getAnnouncements } from "~/models/announcement.server";
import { getRecentComments } from "~/models/comment.server";
import { createPost, getPosts } from "~/models/post.server";
import { requireOptionalUser, requireUser } from "~/session.server";
import { validateAddPostFormData } from "~/validators/community.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireOptionalUser(request, Access.Basic);
  const getPrivate = user
    ? access(user, Access.ManageCommunity)
      ? true
      : user.username
    : false;

  const announcements = await getAnnouncements();
  const posts = await getPosts(1, getPrivate);
  const recentComments = await getRecentComments(!!getPrivate);

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
    const { content, isPrivate } = res.data;

    await createPost(username, content, isPrivate === "true");
  }

  return null;
}

export default function Index() {
  const { announcements, posts, recentComments } =
    useLoaderData<typeof loader>();

  const user = useOptionalUser();

  return (
    <>
      <VStack w={{ base: "100%", md: "75%" }} spacing={6}>
        {user ? <AddPost /> : null}

        <Posts posts={posts} />
      </VStack>

      <VStack w={{ base: "100%", md: "25%" }} spacing={4}>
        <Module title="community.announcements" />
        <Announcements announcements={announcements} />

        <Divider />

        <Module title="community.countdowns" />
        <Countdowns />

        <Divider />

        <Module title="community.recentComments" />
        <RecentComments comments={recentComments} />
      </VStack>
    </>
  );
}
