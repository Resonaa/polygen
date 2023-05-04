import { Comment as SemanticComment } from "semantic-ui-react";

import CommentElement from "~/components/comment";
import type { Comment } from "~/models/comment.server";

interface ExportedComments {
  username: Comment["username"];
  content: Comment["content"];
  parentId: Comment["parentId"];
  id: Comment["id"];
  createdAt: string;
}

export function RecentComments({ comments }: { comments: ExportedComments[] }) {
  return (
    <SemanticComment.Group size="small" minimal>
      {comments.map(({ username, content, parentId, createdAt, id }) => (
        <CommentElement key={id} createdAt={createdAt} username={username} content={content} parentId={parentId}
                        id={id} />
      ))}
    </SemanticComment.Group>
  );
}