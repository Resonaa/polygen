import type { LoaderArgs, ActionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";
import Vditor from "vditor";
import { Button, Feed, Grid, Header, Icon, Segment, Comment as SemanticComment, List } from "semantic-ui-react";

import { getPost } from "~/models/post.server";
import { requireAuthenticatedOptionalUser, requireAuthenticatedUser } from "~/session.server";
import { Access, ajax, vditorConfig } from "~/utils";
import { createComment, getComments } from "~/models/comment.server";
import Layout from "~/components/layout";
import { Avatar, formatDate, UserLink } from "~/components/community";
import Post from "~/components/post";
import Comment from "~/components/comment";

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireAuthenticatedOptionalUser(request, Access.VisitWebsite);

  invariant(params.postId, "缺少postId");
  const id = Number(params.postId);

  const post = await getPost({ id });
  if (!post) {
    throw new Response("说说不存在", { status: 404 });
  }

  const comments = await getComments({ parentId: post.id, page: 1 });

  return json({ post, comments, user });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: `${data.post.username}的说说 - polygen`
  };
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const { username } = await requireAuthenticatedUser(request, Access.Community);
  const content = formData.get("content");
  const parentId = Number(formData.get("parentId"));

  if (!parentId || parentId <= 0)
    return json("说说ID不合法", { status: 400 });

  if (typeof content !== "string" || content.length <= 0 || content.length >= 10000)
    return json("评论长度应为1~10000个字符", { status: 400 });

  await createComment({ username, content, parentId });

  return json("发布成功");
}

export default function PostId() {
  const { user, post, comments: originalComments } = useLoaderData<typeof loader>();
  const [comments, setComments] = useState(originalComments);

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
      submit({ content, parentId: String(post.id) }, { method: "post" });
    }
  };

  useEffect(() => {
    (async () => {
      if (actionData === "发布成功" && transition.state !== "submitting") {
        vd?.setValue("");
        const data = await ajax("post", "/post/comment", { page: 1, parentId: post.id });

        setComments(posts => {
          const maxId = posts[0].id, newMaxId = data[0].id;
          const page = Math.ceil(posts.length / 10);

          return data.slice(0, newMaxId - maxId).concat(posts).slice(0, page * 10);
        });
      }
    })();
  }, [actionData, vd, transition.state, post.id]);

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
        const data = await ajax("post", "/post/comment", { page, parentId: post.id });

        if (data.length < 10)
          page = -1;

        setComments(comments => comments.concat(data));
      } else if (delta > 50) {
        flag = true;
      }
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [post.id]);

  return (
    <Layout columns={2}>
      <Grid.Column width={12}>
        <Feed size="large">
          <Post id={post.id} createdAt={post.createdAt} commentAmount={post._count.comments} content={post.content}
                viewCount={post.viewCount} username={post.username} favouredBy={post.favouredBy} />
        </Feed>

        <SemanticComment.Group size="large" minimal className="!max-w-none">
          {user &&
            (
              <SemanticComment>
                <Avatar username={user.username} />
                <SemanticComment.Content>
                  <UserLink username={user.username} />
                  <SemanticComment.Text>
                    <div id="vditor" className="h-40" />
                    <div className="error-message">{actionData !== "发布成功" && actionData}</div>
                    <Button icon primary labelPosition="left" onClick={sendRequest}
                            loading={transition.state === "submitting"}
                            disabled={transition.state === "submitting"} className="!mt-2">
                      <Icon name="send" />
                      评论
                    </Button>
                  </SemanticComment.Text>
                </SemanticComment.Content>
              </SemanticComment>)}

          {comments.map(({ id, content, username, createdAt }) => (
            <Comment key={id} content={content} username={username} createdAt={createdAt}
                     onReplyClick={(username) => {
                       vd?.setValue(`@${username} ${vd?.getValue()}`);
                       vd?.focus();
                     }
                     } />
          ))}
        </SemanticComment.Group>
      </Grid.Column>

      <Grid.Column width={4}>
        <Header as="h4" attached="top" block>
          说说信息
        </Header>
        <Segment attached="bottom">
          <List relaxed>
            <List.Item>
              <strong>楼主</strong>
              <div className="float-right"><UserLink username={post.username} /></div>
            </List.Item>
            <List.Item>
              <strong>访问量</strong>
              <div className="float-right">{post.viewCount}</div>
            </List.Item>
            <List.Item>
              <strong>发布时间</strong>
              <div className="float-right">{formatDate(post.createdAt)}</div>
            </List.Item>
          </List>

          {user && (
            <Button primary size="tiny" onClick={() => vd?.focus()}>回复</Button>
          )}
        </Segment>
      </Grid.Column>
    </Layout>
  );
}