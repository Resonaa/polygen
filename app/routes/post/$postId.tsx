import type { LoaderArgs, ActionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Vditor from "vditor";
import {
  Button,
  Feed,
  Grid,
  Header,
  Icon,
  Segment,
  Comment as SemanticComment,
  List,
  Pagination
} from "semantic-ui-react";

import { getPost } from "~/models/post.server";
import { requireAuthenticatedOptionalUser, requireAuthenticatedUser } from "~/session.server";
import { Access, ajax, vditorConfig } from "~/utils";
import { createComment } from "~/models/comment.server";
import Layout from "~/components/layout";
import { Avatar, formatDate, UserLink } from "~/components/community";
import Post from "~/components/post";
import Comment from "~/components/comment";

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireAuthenticatedOptionalUser(request, Access.VisitWebsite);

  const id = Number(params.postId);
  if (!id) {
    throw new Response("请求无效", { status: 400, statusText: "Bad Request" });
  }

  const post = await getPost({ id });
  if (!post) {
    throw new Response("说说不存在", { status: 404, statusText: "Not Found" });
  }

  return json({ post, user });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: data ? `${data.post.username}的说说 - polygen` : "错误 - polygen"
  };
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const { username } = await requireAuthenticatedUser(request, Access.Community);
  const content = formData.get("content");
  const parentId = Number(formData.get("parentId"));

  if (!parentId || parentId <= 0)
    return json(false, { status: 400 });

  if (typeof content !== "string" || content.length <= 0 || content.length >= 10000)
    return json(false, { status: 400 });

  await createComment({ username, content, parentId });

  return json(true);
}

export default function PostId() {
  const { user, post } = useLoaderData<typeof loader>();
  const [comments, setComments] = useState([]);

  const [vd, setVd] = useState<Vditor>();

  const [page, setPage] = useState(1);

  const anchor = useRef<HTMLDivElement>(null);

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
    const content = vd?.getValue()?.trim();

    if (content && content.length > 0 && content.length <= 10000) {
      submit({ content, parentId: String(post.id) }, { method: "post" });
    }
  };

  useEffect(() => {
    if (actionData && transition.state !== "submitting") {
      vd?.setValue("");
      setPage(page => {
        if (page === 1) {
          ajax("post", "/post/comment", {
            page: 1,
            parentId: post.id
          }).then(data => setComments(data));
        }

        return 1;
      });
    }
  }, [actionData, vd, transition.state, post.id]);

  useEffect(() => {
    ajax("post", "/post/comment", {
      page,
      parentId: post.id
    }).then(data => setComments(data));
  }, [page, post.id]);

  const handleReplyClick = () => {
    anchor.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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
                    <div id="vditor" className="h-32" />
                    <Button icon primary labelPosition="left" onClick={sendRequest}
                            loading={transition.state === "submitting"}
                            disabled={transition.state === "submitting"} className="!mt-4">
                      <Icon name="send" />
                      评论
                    </Button>
                  </SemanticComment.Text>
                </SemanticComment.Content>
              </SemanticComment>)}

          <div ref={anchor} />

          {comments.map(({ id, content, username, createdAt }) => (
            <Comment key={id} content={content} username={username} createdAt={createdAt}
                     onReplyClick={handleReplyClick} />
          ))}
        </SemanticComment.Group>

        {post._count.comments > 10 && (
          <Pagination
            secondary
            ellipsisItem={null}
            activePage={page}
            firstItem={{ content: <Icon name="angle double left" />, icon: true, disabled: page === 1 }}
            lastItem={{
              content: <Icon name="angle double right" />, icon: true,
              disabled: page === Math.ceil(post._count.comments / 10)
            }}
            prevItem={{ content: <Icon name="angle left" />, icon: true, disabled: page === 1 }}
            nextItem={{
              content: <Icon name="angle right" />, icon: true,
              disabled: page === Math.ceil(post._count.comments / 10)
            }}
            boundaryRange={0}
            siblingRange={2}
            totalPages={Math.ceil(post._count.comments / 10)}
            onPageChange={(_, { activePage }) => {
              setPage(activePage as number);
              handleReplyClick();
            }}
          />)}
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
            <Button primary size="small" onClick={handleReplyClick}>回复</Button>
          )}
        </Segment>
      </Grid.Column>
    </Layout>
  );
}