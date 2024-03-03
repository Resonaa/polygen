import {
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import CommentLeaderboard from "~/components/leaderboard/commentLeaderboard";
import PostLeaderboard from "~/components/leaderboard/postLeaderboard";
import RegistrationTimeLeaderboard from "~/components/leaderboard/registrationTimeLeaderboard";
import StarLeaderboard from "~/components/leaderboard/starLeaderboard";
import { getT } from "~/i18n/i18n";
import { rankList as commentRankList } from "~/models/comment.server";
import { rankList as postRankLink } from "~/models/post.server";
import { rankList as starRankList } from "~/models/star.server";
import { rankList as registrationTimeRankList } from "~/models/user.server";

export async function loader() {
  const star = await starRankList();
  const posts = await postRankLink();
  const comments = await commentRankList();
  const registrationTime = await registrationTimeRankList();

  return json({ star, posts, comments, registrationTime });
}

export const meta: MetaFunction = ({ matches }) => {
  const t = getT(matches);
  return [{ title: t("nav.leaderboard") + " - polygen" }];
};

export default function Leaderboard() {
  const { star, posts, comments, registrationTime } =
    useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <VStack w="100%">
      <Tabs w="100%" isFitted variant="enclosed-colored">
        <TabList>
          <Tab>★</Tab>
          <Tab>{t("leaderboard.posts")}</Tab>
          <Tab>{t("leaderboard.comments")}</Tab>
          <Tab>{t("leaderboard.registrationTime")}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <StarLeaderboard ranks={star} />
          </TabPanel>

          <TabPanel>
            <PostLeaderboard ranks={posts} />
          </TabPanel>

          <TabPanel>
            <CommentLeaderboard ranks={comments} />
          </TabPanel>

          <TabPanel>
            <RegistrationTimeLeaderboard ranks={registrationTime} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
