/* eslint-disable jsx-a11y/anchor-is-valid */
import { Feed, Icon } from "semantic-ui-react";
import { Link } from "@remix-run/react";

import type { Post as PostType } from "~/models/post.server";
import { Avatar, SafeDeltaDate, UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";
import {formatDate} from "~/components/community";

export default function Post({
                               id,
                               username,
                               content,
                               createdAt,
                               viewCount,
                               commentAmount,
                               link
                             }: Pick<PostType, "id" | "username" | "content" | "viewCount"> & { createdAt: string, commentAmount: number, link?: boolean }) {
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
            <Link to={`/post/${id}`} style={{ color: "unset" }}>
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
          <a><Icon name="eye" />{viewCount}</a>
          <a className="ml-8"><Icon name="comment" />{commentAmount}</a>
          <Feed.Like className="ml-8"><Icon name="like" />0</Feed.Like>
        </Feed.Meta>
      </Feed.Content>
    </Feed.Event>
  );
}