/* eslint-disable jsx-a11y/anchor-is-valid */
import { Link } from "@remix-run/react";
import { useState } from "react";
import { Feed, Icon } from "semantic-ui-react";

import { Avatar, relativeDate, UserLink } from "~/components/community";
import { formatDate, formatLargeNumber } from "~/components/community";
import RenderedText from "~/components/renderedText";
import type { Post as PostType } from "~/models/post.server";
import { useOptionalUser, ajax } from "~/utils";

export default function Post({
                               id,
                               username,
                               content,
                               createdAt,
                               viewCount,
                               commentAmount,
                               link,
                               favouredBy
                             }: Pick<PostType, "id" | "username" | "content" | "viewCount"> &
  { createdAt: string, commentAmount: number, link?: boolean, favouredBy: { username: string }[] }) {
  const postUrl = `/post/${id}`;
  const user = useOptionalUser();

  const [favour, setFavour] = useState(user ? favouredBy.some(({ username }) => username === user.username) : false);
  const [likes, setLikes] = useState(favouredBy.length);

  const views = formatLargeNumber(viewCount);

  return (
    <Feed.Event>
      <Feed.Label>
        <Avatar username={username} />
      </Feed.Label>
      <Feed.Content className="overflow-x-auto">
        <Feed.Summary>
          <UserLink username={username} />
          <Feed.Date title={formatDate(createdAt)}>
            {relativeDate(createdAt)}
          </Feed.Date>
        </Feed.Summary>

        {link ? (
          <Feed.Extra text className="max-h-72 overflow-auto !max-w-none" style={{ overflowWrap: "anywhere" }}>
            <Link to={postUrl} style={{ color: "unset" }}>
              <object>
                <RenderedText content={content} mode="light" />
              </object>
            </Link>
          </Feed.Extra>
        ) : (
          <Feed.Extra text className="overflow-auto !max-w-none" style={{ overflowWrap: "anywhere" }}>
            <object>
              <RenderedText content={content} mode="light" />
            </object>
          </Feed.Extra>
        )}

        <Feed.Meta>
          {link ? (
            <>
              <Link to={postUrl}><Icon name="eye" />{views}</Link>
              <Link to={postUrl} className="!ml-6"><Icon name="comment" />{commentAmount}</Link>
            </>) : (
            <>
              <Icon name="eye" />{views}
              <Icon name="comment" className="!ml-6" />{commentAmount}
            </>)}

          <Feed.Like className={`!ml-6 ${favour ? "active" : ""}`} onClick={async () => {
            if (favour || !user)
              return;

            setFavour(true);
            setLikes(likes => likes + 1);

            await ajax("post", "/post/favour", { id });
          }}><Icon name="like" />{likes}</Feed.Like>
        </Feed.Meta>
      </Feed.Content>
    </Feed.Event>
  );
}