import { Link } from "@remix-run/react";
import { Comment as SemanticComment } from "semantic-ui-react";

import { Avatar, formatDate, relativeDate, UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";
import type { Comment } from "~/models/comment.server";

interface ExportedComments {
  username: Comment["username"];
  content: Comment["content"];
  parentId: Comment["parentId"];
  createdAt: string;
}

export function RecentComments({ comments }: { comments: ExportedComments[] }) {
  return (
    <SemanticComment.Group size="small" minimal>
      {comments.map(({ username, content, parentId, createdAt }) => (
        <SemanticComment key={createdAt}>
          <Avatar username={username} />
          <SemanticComment.Content>
            <UserLink username={username} />
            <SemanticComment.Metadata>
              <span title={formatDate(createdAt)}>
                {relativeDate(createdAt)}
              </span>
            </SemanticComment.Metadata>
            <SemanticComment.Text className="max-h-40 overflow-auto !max-w-none">
              <Link to={"/post/" + parentId} style={{ color: "unset" }}>
                <object>
                  <RenderedText content={content} mode="light" />
                </object>
              </Link>
            </SemanticComment.Text>
          </SemanticComment.Content>
        </SemanticComment>
      ))}
    </SemanticComment.Group>
  );
}