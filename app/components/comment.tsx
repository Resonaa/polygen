import { Link } from "@remix-run/react";
import clsx from "clsx";
import { Comment as SemanticComment } from "semantic-ui-react";

import { formatDate } from "~/components/community";
import { Avatar, relativeDate, UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";
import type { Comment as CommentType } from "~/models/comment.server";
import { ajax, useOptionalUser } from "~/utils";

export default function Comment({
                                  username,
                                  content,
                                  createdAt,
                                  parentId,
                                  id
                                }: Pick<CommentType, "username" | "content" | "id"> & {
  createdAt: string,
  parentId?: CommentType["parentId"]
}) {
  const user = useOptionalUser();

  return (
    <SemanticComment>
      <Avatar username={username} />
      <SemanticComment.Content>
        <UserLink username={username} />
        <SemanticComment.Metadata>
          <span title={formatDate(createdAt)}>
            {relativeDate(createdAt)}
          </span>
        </SemanticComment.Metadata>
        <SemanticComment.Text className={clsx(parentId ? "max-h-40" : "max-h-60", "overflow-auto !max-w-none")}>
          {
            parentId ? (
              <Link to={"/post/" + parentId} style={{ color: "unset" }}>
                <object>
                  <RenderedText html={content} mode="light" />
                </object>
              </Link>
            ) : (<RenderedText html={content} mode="light" />)}
        </SemanticComment.Text>
        {user?.username === username && (
          <SemanticComment.Actions>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() =>
              ajax("post", "/comment/delete", { id }).then(() => window.location.reload())
            }>删除</a>
          </SemanticComment.Actions>
        )}
      </SemanticComment.Content>
    </SemanticComment>
  );
}