import { useEffect, useRef, useState } from "react";
import { Input, Comment, Dropdown } from "semantic-ui-react";

import { MessageType } from "~/core/server/message";
import { getColorByMessageType, Messages } from "~/core/client/message";
import type { ClientSocket } from "~/core/types";

export function Chat({ client }: { client?: ClientSocket }) {
  function ChatForm() {
    const options = [
      { key: MessageType.Room, text: MessageType.Room, value: MessageType.Room },
      { key: MessageType.World, text: MessageType.World, value: MessageType.World },
      { key: MessageType.Team, text: MessageType.Team, value: MessageType.Team }
    ];

    const [type, setType] = useState(MessageType.Room);
    const contentRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
      if (!contentRef.current) return;

      const content = contentRef.current.value.trim();

      if (content.length <= 0 || content.length > 616)
        return;

      client?.emit("message", { type, content });

      contentRef.current.value = "";
    };

    const handleEnter = (e: KeyboardEvent) => {
      const input = contentRef.current;

      if (!input || e.key !== "Enter" || e.ctrlKey)
        return;

      e.preventDefault();

      if (document.activeElement === input) {
        setTimeout(() => input.blur(), 200);
        handleSubmit();
      } else {
        input.focus();
      }
    };

    useEffect(() => {
      window.addEventListener("keydown", handleEnter);
      return () => {
        window.removeEventListener("keydown", handleEnter);
      };
    });

    return (
      <Input
        label={<Dropdown className={`button icon ${getColorByMessageType(type)}`} options={options}
                         defaultValue={MessageType.Room}
                         onChange={(_, data) => setType(data.value as MessageType)} />}
        labelPosition="right"
        placeholder="输入聊天内容"
        input={{ className: "!text-white !bg-black !transition-colors", ref: contentRef }}
        fluid
      />
    );
  }

  return (
    <>
      <Comment.Group minimal className="max-h-52 overflow-auto !m-0">
        <Messages client={client} />
      </Comment.Group>

      <ChatForm />
    </>
  );
}