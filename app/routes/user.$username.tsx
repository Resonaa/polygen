import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, NodeOnDiskFile } from "@remix-run/node";
import {
  json,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData
} from "@remix-run/node";
import { Form as ReactForm, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button, Divider, Form, Grid, Icon, Statistic } from "semantic-ui-react";

import Access from "~/access";
import { formatDate, relativeDate, Star } from "~/components/community";
import Layout from "~/components/layout";
import { formatStar } from "~/core/client/utils";
import { getPostsByUsername } from "~/models/post.server";
import { getStats, getUser, updateAvatar, updateBio } from "~/models/user.server";
import { badRequest, notFound } from "~/reponses.server";
import { requireAuthenticatedUser } from "~/session.server";
import { useOptionalUser } from "~/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const username = String(params.username);
  if (!username) {
    throw badRequest("请求无效");
  }

  const user = await getUser(username);
  if (!user) {
    throw notFound("用户不存在");
  }

  const stats = await getStats(username);

  const posts = await getPostsByUsername(username, 1);

  return json({ user, stats, originalPosts: posts });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuthenticatedUser(request, Access.Settings);

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      file: ({ filename }) => filename
    }),
    unstable_createMemoryUploadHandler()
  );

  try {
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );

    const avatar = formData.get("avatar");
    const bio = formData.get("bio");

    if (typeof bio !== "string" || bio.length > 161) {
      return json("个性签名不合法", { status: 400 });
    }

    await updateBio(user.username, bio);

    if (!avatar) {
      return json("编辑成功");
    }

    const data = avatar as unknown as NodeOnDiskFile;
    await updateAvatar(user.username, data);
    await data.remove();
  } catch {
    return json("编辑失败", { status: 400 });
  }

  return json("编辑成功");
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [{ title: data ? `${data.user.username} - polygen` : "错误 - polygen" }];

export default function User() {
  const { user, stats, originalPosts } = useLoaderData<typeof loader>();
  const [posts, setPosts] = useState(originalPosts);
  const [canScroll] = useState(false);
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

  return (
    <Layout columns={2}>
      <Grid.Column width={4}>
        <div className="max-md:flex max-md:items-center">
          <img alt="avatar" src={`/usercontent/avatar/${user.username}.avif`}
               className="md:w-full max-md:w-[80px] max-md:inline-block" />
          <div className="inline-block max-md:ml-6 md:mt-2">
            <div className="text-2xl" title={`权限等级：${user.access}`}>{user.username}</div>
            {user.bio.length > 0 && <div className="mt-2 break-all">{user.bio}</div>}
          </div>
        </div>
        {edit ? (
          <Form as={ReactForm} method="post" action="." encType="multipart/form-data" className="mt-4">
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
        {stats.star !== undefined && stats.rank !== undefined && (
          <Statistic.Group className="justify-center" size="small">
            <Statistic>
              <Statistic.Value>
                <span title={stats.star.toString()}>
                  <Star />{formatStar(stats.star, 2)}
                </span>
              </Statistic.Value>
              <Statistic.Label>#{stats.rank}</Statistic.Label>
            </Statistic>
          </Statistic.Group>
        )}

        <Statistic.Group className="justify-center" size="small">
          <Statistic>
            <Statistic.Value>{stats.posts}</Statistic.Value>
            <Statistic.Label>说说</Statistic.Label>
          </Statistic>
          <Statistic>
            <Statistic.Value>{stats.comments}</Statistic.Value>
            <Statistic.Label>评论</Statistic.Label>
          </Statistic>
        </Statistic.Group>
      </Grid.Column>
    </Layout>
  );
}