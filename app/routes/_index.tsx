import type { LoaderArgs, ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button, Feed, Grid, Header, Icon, Segment } from "semantic-ui-react";
import Vditor from "vditor";

import Announcement from "~/components/announcement";
import { Avatar, UserLink } from "~/components/community";
import CountDown from "~/components/countdown";
import Post from "~/components/post";
import { RecentComments } from "~/components/recentComments";
import { VditorSkeleton } from "~/components/vditorSkeleton";
import { getAnnouncements } from "~/models/announcement.server";
import { getComments } from "~/models/comment.server";
import { createPost, getPosts } from "~/models/post.server";
import { requireAuthenticatedOptionalUser, requireAuthenticatedUser } from "~/session.server";
import { Access, ajax, vditorConfig } from "~/utils";

import Layout from "../components/layout";

export const meta: V2_MetaFunction = () => [{ title: "首页 - polygen" }];

export async function loader({ request }: LoaderArgs) {
  const user = await requireAuthenticatedOptionalUser(request, Access.Basic);
  const announcements = await getAnnouncements();
  const posts = await getPosts(1);
  const recentComments = await getComments({ page: 1 });

  return json({ announcements, user, originalPosts: posts, recentComments });
}


export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const { username } = await requireAuthenticatedUser(request, Access.Community);
  const content = formData.get("content");

  if (typeof content !== "string" || content.length <= 0 || content.length >= 100000)
    return json(false, { status: 400 });

  await createPost({ username, content });

  return json(true);
}

export default function Index() {
  const { announcements, user, originalPosts, recentComments } = useLoaderData<typeof loader>();
  const [posts, setPosts] = useState(originalPosts);

  const [vd, setVd] = useState<Vditor>();

  useEffect(() => {
    const vditor = new Vditor("vditor", {
      ...vditorConfig, after: () => {
        setVd(vditor);
      }
    });
  }, []);

  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const sendRequest = () => {
    const content = vd?.getValue();

    if (content?.trim()) {
      submit({ content }, { method: "post" });
    }
  };

  useEffect(() => {
    (async () => {
      if (actionData && navigation.state !== "submitting") {
        vd?.setValue("");
        const data = await ajax("post", "/post/page", { page: 1 });

        setPosts(posts => {
          const maxId = posts[0].id, newMaxId = data[0].id;
          const page = Math.ceil(posts.length / 10);

          return data.slice(0, newMaxId - maxId).concat(posts).slice(0, page * 10);
        });
      }
    })();
  }, [actionData, vd, navigation.state]);

  const loadMore = () => {
    if (page === -1 || loading)
      return;

    setLoading(true);

    ajax("post", "/post/page", { page: page + 1 }).then(data => {
      setLoading(false);
      setPage(data.length < 10 ? -1 : page + 1);
      setPosts(posts => posts.concat(data));
    });
  };

  return (
    <Layout columns={2}>
      <Grid.Column width={12}>
        <Feed size="large">
          {user &&
            (<Feed.Event>
              <Feed.Label>
                <Avatar username={user.username} />
              </Feed.Label>
              <Feed.Content>
                <Feed.Summary>
                  <UserLink username={user.username} />
                </Feed.Summary>

                <Feed.Extra text className="!max-w-none">
                  <VditorSkeleton />
                  <Button icon primary labelPosition="left" onClick={sendRequest}
                          loading={navigation.state === "submitting"}
                          disabled={navigation.state === "submitting"} className="!mt-4">
                    <Icon name="send" />
                    发布
                  </Button>
                </Feed.Extra>
              </Feed.Content>
            </Feed.Event>)}

          {posts.map(({ id, content, username, createdAt, viewCount, _count: { comments }, favouredBy }) => (
            <Post key={id} id={id} content={content} username={username} createdAt={createdAt}
                  viewCount={viewCount} commentAmount={comments} favouredBy={favouredBy} link />
          ))}

          {page !== -1 &&
            (<Segment textAlign="center" loading={loading} basic onClick={loadMore}
                      className={clsx(!loading && "cursor-pointer text-gray-400")}>
              点击查看更多...
            </Segment>)}
        </Feed>
      </Grid.Column>

      <Grid.Column width={4}>
        <Header as="h4" attached="top" block>
          <Icon name="bullhorn" className="!text-base !align-baseline" />
          公告
        </Header>
        <Segment attached="bottom">
          {announcements.map(({ id, title, content }) => (
            <Announcement id={id} title={title} content={content} key={id} />
          ))}
        </Segment>

        <Header as="h4" attached="top" block>
          <Icon name="calendar alternate" className="!text-base !align-baseline" />
          倒计时
        </Header>
        <Segment attached="bottom" textAlign="center">
          <CountDown />
        </Segment>

        <Header as="h4" attached="top" block>
          <Icon name="comments" className="!text-base !align-baseline" />
          最新评论
        </Header>
        <Segment attached="bottom">
          <RecentComments comments={recentComments} />
        </Segment>
      </Grid.Column>
    </Layout>
  );
}
