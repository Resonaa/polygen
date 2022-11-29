import { useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Button, Feed, Grid, Header, Icon, Segment } from "semantic-ui-react";

import Layout from "../components/layout";
import Announcement from "~/components/announcement";
import { Access, ajax, vditorConfig } from "~/utils";

import { getAnnouncements } from "~/models/announcement.server";
import { requireAuthenticatedOptionalUser, requireAuthenticatedUser } from "~/session.server";
import { createPost, getPosts } from "~/models/post.server";
import Post from "~/components/post";
import { Avatar, UserLink } from "~/components/community";
import Vditor from "vditor";

export function meta() {
  return {
    title: "首页 - polygen"
  };
}

export async function loader({ request }: LoaderArgs) {
  const user = await requireAuthenticatedOptionalUser(request, Access.VisitWebsite);
  const announcements = await getAnnouncements();
  const posts = await getPosts(1);

  return json({ announcements, user, originalPosts: posts });
}


export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const { username } = await requireAuthenticatedUser(request, Access.Community);
  const content = formData.get("content");


  if (typeof content !== "string" || content.length <= 0 || content.length >= 100000)
    return json("说说长度应为1~100000个字符", { status: 400 });

  await createPost({ username, content });

  return json("发布成功");
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

  const sendRequest = () => {
    const content = vd?.getValue();

    if (content?.trim()) {
      submit({ content }, { method: "post" });
    }
  };

  useEffect(() => {
    (async () => {
      if (actionData === "发布成功" && transition.state !== "submitting") {
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

  useEffect(() => {
    let flag = true, page = 1;

    const handleScroll = async () => {
      if (page === -1)
        return;

      const element = document.scrollingElement;

      if (!element)
        return;

      const delta = element.scrollHeight - element.scrollTop - element.clientHeight;

      if (flag && delta <= 5) {
        flag = false;

        page++;
        const data = await ajax("post", "/post/page", { page });

        if (data.length < 10)
          page = -1;

        setPosts(posts => posts.concat(data));
      } else if (delta > 50) {
        flag = true;
      }
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

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
                  <div id="vditor" className="h-40" />
                  <div className="error-message">{actionData !== "发布成功" && actionData}</div>
                  <Button icon primary labelPosition="left" onClick={sendRequest}
                          loading={transition.state === "submitting"}
                          disabled={transition.state === "submitting"} className="!mt-2">
                    <Icon name="send" />
                    发布
                  </Button>
                </Feed.Extra>
              </Feed.Content>
            </Feed.Event>)}

          {posts.map(({ id, content, username, createdAt, viewCount, _count: { comments } }) => (
            <Post key={id} id={id} content={content} username={username} createdAt={createdAt}
                  viewCount={viewCount} commentAmount={comments} link />
          ))}
        </Feed>
      </Grid.Column>

      <Grid.Column width={4}>
        <Header as="h4" attached="top" block>
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
