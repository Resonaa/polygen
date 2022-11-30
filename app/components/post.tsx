/* eslint-disable jsx-a11y/anchor-is-valid */
import { Feed, Icon } from "semantic-ui-react";
import { Link } from "@remix-run/react";
import { useState } from "react";

import type { Post as PostType } from "~/models/post.server";
import { Avatar, SafeDeltaDate, UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";
import { formatDate } from "~/components/community";
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

  return (
    <Feed.Event>
      <Feed.Label>
        <Avatar username={username} />
      </Feed.Label>
      <Feed.Content>
        <Feed.Summary>
          <UserLink username={username} />
          <Feed.Date title={formatDate(createdAt)}>
            <SafeDeltaDate date={createdAt} />
          </Feed.Date>
        </Feed.Summary>

        {link ? (
          <Feed.Extra text className="max-h-72 overflow-auto !max-w-none" style={{ overflowWrap: "anywhere" }}>
            <Link to={postUrl} style={{ color: "unset" }}>
              <object>
                <RenderedText content={content} />
              </object>
            </Link>
          </Feed.Extra>
        ) : (
          <Feed.Extra text className="overflow-auto !max-w-none" style={{ overflowWrap: "anywhere" }}>
            <object>
              <RenderedText content={content} />
            </object>
          </Feed.Extra>
        )}

        <Feed.Meta>
          <Link to={postUrl}><Icon name="eye" />{viewCount}</Link>
          <Link to={postUrl} className="!ml-6"><Icon name="comment" />{commentAmount}</Link>
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