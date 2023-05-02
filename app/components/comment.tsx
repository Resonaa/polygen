/* eslint-disable jsx-a11y/anchor-is-valid */
import { Comment as SemanticComment } from "semantic-ui-react";

import { formatDate } from "~/components/community";
import { Avatar, relativeDate, UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";
import type { Comment as CommentType } from "~/models/comment.server";

export default function Comment({
                                  username,
                                  content,
                                  createdAt
                                }: Pick<CommentType, "username" | "content"> & { createdAt: string }) {
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
        <SemanticComment.Text className="max-h-60 overflow-auto !max-w-none">
          <RenderedText html={content} mode="light" />
        </SemanticComment.Text>
      </SemanticComment.Content>
    </SemanticComment>
  );
}