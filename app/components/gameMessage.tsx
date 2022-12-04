import { Comment, Label } from "semantic-ui-react";

import type { Message } from "~/core/server/message";
import { MessageType } from "~/core/server/message";
import { UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";

export default function GameMessage({ type, content, username, time }: Message) {
  return (
    <Comment className="!p-0">
      <Comment.Content>
        <UserLink username={username} />

        <Comment.Metadata>
          {time}
          <Label color={type === MessageType.Room ? "yellow" : "blue"} size="mini" className="!ml-2">{type}</Label>
        </Comment.Metadata>

        <Comment.Text className="overflow-y-auto max-h-52">
          <RenderedText content={content} />
        </Comment.Text>
      </Comment.Content>
    </Comment>
  );
}