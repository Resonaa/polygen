/* eslint-disable jsx-a11y/anchor-is-valid */

import { Comment as SemanticComment } from "semantic-ui-react";

import type { Comment as CommentType } from "~/models/comment.server";
import { formatDate } from "~/components/community";
import { Avatar, SafeDeltaDate, UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";

export default function Comment({
                                  username,
                                  content,
                                  createdAt,
                                  onReplyClick,
                                  reply
                                }: Pick<CommentType, "username" | "content"> & { createdAt: string, onReplyClick: (_: string) => void, reply: boolean }) {
  return (
    <SemanticComment>
      <Avatar username={username} />
      <SemanticComment.Content>
        <UserLink username={username} />
        <SemanticComment.Metadata>
          <span title={formatDate(createdAt)}>
            <SafeDeltaDate date={createdAt} />
          </span>
        </SemanticComment.Metadata>
        <SemanticComment.Text className="max-h-60 overflow-auto !max-w-none">
          <RenderedText content={content} />
        </SemanticComment.Text>
        {reply && <SemanticComment.Actions>
          <a onClick={() => onReplyClick(username)}>回复</a>
        </SemanticComment.Actions>}
      </SemanticComment.Content>
    </SemanticComment>
  );
}