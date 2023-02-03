import { useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Button, Feed, Grid, Header, Icon, Segment } from "semantic-ui-react";
import Vditor from "vditor";

import Layout from "../components/layout";
import Announcement from "~/components/announcement";
import { Access, ajax, vditorConfig } from "~/utils";
import Post from "~/components/post";
import Quote from "~/components/quote";
import { Avatar, UserLink } from "~/components/community";

import { getAnnouncements } from "~/models/announcement.server";
import { requireAuthenticatedOptionalUser, requireAuthenticatedUser } from "~/session.server";
import { createPost, getPosts } from "~/models/post.server";
import clsx from "clsx";

export function meta() {
  return {
    title: "首页 - polygen"
  };
}

export async function loader({ request }: LoaderArgs) {
  const user = await requireAuthenticatedOptionalUser(request, Access.Basic);
  const announcements = await getAnnouncements();
  const posts = await getPosts(1);

  return json({ announcements, user, originalPosts: posts });
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
  const { announcements, user, originalPosts } = useLoaderData<typeof loader>();
  const [posts, setPosts] = useState(originalPosts);

  const [vd, setVd] = useState<Vditor>();

  useEffect(() => {
    const vditor = new Vditor("vditor", {
      ...vditorConfig, after: () => {
        setVd(vditor);
      }
    });
  }, []);

  const transition = useTransition();
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
      if (actionData && transition.state !== "submitting") {
        vd?.setValue("");
        const data = await ajax("post", "/post/page", { page: 1 });

        setPosts(posts => {
          const maxId = posts[0].id, newMaxId = data[0].id;
          const page = Math.ceil(posts.length / 10);

          return data.slice(0, newMaxId - maxId).concat(posts).slice(0, page * 10);
        });
      }
    })();
  }, [actionData, vd, transition.state]);

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
                  <div id="vditor" className="h-32" />
                  <Button icon primary labelPosition="left" onClick={sendRequest}
                          loading={transition.state === "submitting"}
                          disabled={transition.state === "submitting"} className="!mt-4">
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
          <Icon name="quote left" className="!text-base !align-baseline" />
          一言
        </Header>
        <Segment attached="bottom" textAlign="center">
          <Quote />
        </Segment>

        <Header as="h4" attached="top" block>
          <Icon name="info" className="!text-base !align-baseline" />
          本站公告
        </Header>
        <Segment attached="bottom">
          {announcements.map(({ id, title, content }) => (
            <Announcement id={id} title={title} content={content} key={id} />
          ))}
        </Segment>
      </Grid.Column>
    </Layout>
  );
}
