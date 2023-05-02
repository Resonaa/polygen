import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form as ReactForm, useActionData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Divider, Grid, Icon, Statistic, Feed, Pagination, Button, Form } from "semantic-ui-react";

import { formatDate, relativeDate } from "~/components/community";
import Layout from "~/components/layout";
import Post from "~/components/post";
import { getPostsByUsername } from "~/models/post.server";
import { getStatsByUsername, getUserWithoutPasswordByUsername } from "~/models/user.server";
import { requireAuthenticatedOptionalUser } from "~/session.server";
import { Access, ajax, useOptionalUser } from "~/utils";
import { renderText } from "~/utils.server";

import type { action } from "./profile";

export async function loader({ request, params }: LoaderArgs) {
  await requireAuthenticatedOptionalUser(request, Access.Basic);

  const username = String(params.username);
  if (!username) {
    throw new Response("请求无效", { status: 400, statusText: "Bad Request" });
  }

  const user = await getUserWithoutPasswordByUsername(username);
  if (!user) {
    throw new Response("用户不存在", { status: 404, statusText: "Not Found" });
  }

  const stats = await getStatsByUsername(username);

  const posts = await getPostsByUsername({ username, page: 1 });
  for (let post of posts) {
    post.content = renderText(post.content);
  }

  return json({ user, stats, originalPosts: posts });
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [{ title: data ? `${data.user.username} - polygen` : "错误 - polygen" }];

export default function User() {
  const { user, stats, originalPosts } = useLoaderData<typeof loader>();
  const [posts, setPosts] = useState(originalPosts);
  const [page, setPage] = useState(1);
  const [canScroll, setCanScroll] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const currentUser = useOptionalUser();
  const [edit, setEdit] = useState(false);
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    canScroll && anchor.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [posts, canScroll]);

  useEffect(() => {
    setPosts(originalPosts);
  }, [originalPosts]);

  useEffect(() => {
    if (actionData && actionData === "编辑成功") {
      window.location.reload();
    }
  }, [actionData]);

  function Navigation() {
    return (
      <>
        {stats.posts !== undefined && stats.posts > 10 && (<Pagination
          secondary
          ellipsisItem={null}
          activePage={page}
          firstItem={{ content: <Icon name="angle double left" />, icon: true, disabled: page === 1 }}
          lastItem={{
            content: <Icon name="angle double right" />, icon: true,
            disabled: page === Math.ceil(stats.posts / 10)
          }}
          prevItem={{ content: <Icon name="angle left" />, icon: true, disabled: page === 1 }}
          nextItem={{
            content: <Icon name="angle right" />, icon: true,
            disabled: page === Math.ceil(stats.posts / 10)
          }}
          boundaryRange={0}
          siblingRange={2}
          totalPages={Math.ceil(stats.posts / 10)}
          onPageChange={(_, { activePage }) => {
            ajax("post", "/post/user", {
              page: activePage,
              username: user.username
            }).then(data => {
              setCanScroll(true);
              setPosts(data);
              setPage(activePage as number);
            });
          }}
        />)}
      </>
    );
  }

  return (
    <Layout columns={2}>
      <Grid.Column width={4}>
        <div className="max-md:flex max-md:items-center">
          <img alt="avatar" src={`/usercontent/avatar/${user.username}.webp`}
               className="md:w-full max-md:w-[80px] max-md:inline-block" />
          <div className="inline-block max-md:ml-6 md:mt-2">
            <div className="text-2xl" title={`权限等级：${user.access}`}>{user.username}</div>
            {user.bio.length > 0 && <div className="mt-2 break-all">{user.bio}</div>}
          </div>
        </div>
        {edit ? (
          <Form as={ReactForm} method="post" encType="multipart/form-data" action="/profile" className="mt-4">
            <Form.Field>
              <label>头像</label>
              <input type="file" name="avatar" accept=".jpeg,.jpg,.png,.webp,.avif,.tiff,.gif,.svg" />
            </Form.Field>
            <Form.Field>
              <label>个性签名</label>
              <TextareaAutosize maxLength={161} defaultValue={user.bio} name="bio" rows={2} />
            </Form.Field>
            <Button positive type="submit">保存</Button>
            <Button onClick={() => setEdit(false)}>取消</Button>
            {actionData && actionData !== "编辑成功" && (
              <div className="error-message">
                {actionData}
              </div>
            )}
          </Form>
        ) : (
          <>
            {currentUser && currentUser.username === user.username ? (
              <Button fluid className="!my-4" onClick={() => setEdit(true)}>编辑资料</Button>
            ) : <Divider />}
            <div>
              <Icon name="time" />
              加入于 <span title={formatDate(user.createdAt)}>{relativeDate(user.createdAt)}</span>
            </div>
          </>
        )}
      </Grid.Column>
      <Grid.Column width={12}>
        <div ref={anchor} />
        <Statistic.Group className="justify-center">
          <Statistic>
            <Statistic.Value>{stats.posts}</Statistic.Value>
            <Statistic.Label>说说</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{stats.comments}</Statistic.Value>
            <Statistic.Label>评论</Statistic.Label>
          </Statistic>
        </Statistic.Group>

        <Navigation />
        <Feed size="large">
          {posts.map(({ id, content, username, createdAt, viewCount, _count: { comments }, favouredBy }) => (
            <Post key={id} id={id} content={content} username={username} createdAt={createdAt}
                  viewCount={viewCount} commentAmount={comments} favouredBy={favouredBy} link />
          ))}
        </Feed>
        <Navigation />
      </Grid.Column>
    </Layout>
  );
}