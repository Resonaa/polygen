import { useEffect, useState } from "react";
import { Input } from "semantic-ui-react";

import { MessageType } from "~/core/server/message";
import { Messages } from "~/core/client/message";
import type { ClientSocket } from "~/core/types";

export function Chat({ client }: { client?: ClientSocket }) {
  function ChatForm() {
    const [type, setType] = useState(MessageType.Room);
    const [content, setContent] = useState("");

    const handleSubmit = () => {
      if (content.length <= 0 || content.length > 616)
        return;

      client?.emit("message", { type, content });

      setContent("");
    };

    const handleEnter = (e: KeyboardEvent) => {
      const input = document.querySelector("input");

      if (!input)
        return;

      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && document.activeElement === input) {
        e.preventDefault();
        const types = [MessageType.Room, MessageType.World, MessageType.Team];
        setType(type => types[(types.indexOf(type) + (e.key === "ArrowDown" ? 1 : 2)) % types.length]);
        return;
      } else if (e.key === "Enter" && !e.ctrlKey) {
        e.preventDefault();

        if (document.activeElement === input) {
          setTimeout(() => input.blur(), 100);
          handleSubmit();
        } else
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
        placeholder={`发送至：${type}`}
        input={{
          className: `!text-white !bg-black !transition-colors ${type}`, autoComplete: "off",
          value: content
        }}
        fluid
        onChange={(_, { value }) => setContent(value)}
      />
    );
  }

  return (
    <>
      <div className="messages max-h-52 overflow-auto !m-0">
        <Messages client={client} />
      </div>

      <ChatForm />
    </>
  );
}