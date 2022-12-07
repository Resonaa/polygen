import { useEffect, useRef, useState } from "react";
import { Button, Comment, Dropdown, Form } from "semantic-ui-react";

import { MessageType } from "~/core/server/message";
import { Messages } from "~/core/client/message";
import type { ClientSocket } from "~/core/types";

export function Chat({ client }: { client?: ClientSocket }) {
  function ChatForm() {
    const options = [
      { key: MessageType.Room, text: MessageType.Room, value: MessageType.Room },
      { key: MessageType.World, text: MessageType.World, value: MessageType.World },
      { key: MessageType.Team, text: MessageType.Team, value: MessageType.Team }
    ];

    const [type, setType] = useState(MessageType.Room);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
      if (!contentRef.current)
        return;

      const content = contentRef.current.value.trim();

      if (content.length <= 0 || content.length > 616)
        return;

      client?.emit("message", { type, content });
      contentRef.current.value = "";
    };

    const handleEnter = (e: KeyboardEvent) => {
      if (!contentRef.current || e.key !== "Enter")
        return;

      const textarea = contentRef.current;

      if (document.activeElement === textarea) {
        e.preventDefault();
        if (e.ctrlKey) {
          const start = textarea.selectionStart, end = textarea.selectionEnd;
          const content = textarea.value;
          textarea.value = content.substring(0, start) + "\n" + content.substring(end, content.length);
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        } else {
          setTimeout(() => textarea.blur(), 200);
          handleSubmit();
        }
      } else if (!e.ctrlKey) {
        e.preventDefault();
        textarea.focus();
      }
    };

    useEffect(() => {
      window.addEventListener("keydown", handleEnter);
      return () => {
        window.removeEventListener("keydown", handleEnter);
      };
    });

    return (
      <Form inverted>
        <Form.Field>
          <textarea rows={2} placeholder="输入聊天内容" className="!text-white !bg-black !transition-colors"
                    ref={contentRef} />
        </Form.Field>

        <Form.Field>
          <Button.Group primary inverted size="small">
            <Dropdown className="button icon" options={options} defaultValue={MessageType.Room} floating
                      onChange={(_, data) => setType(data.value as MessageType)} />
            <Button onClick={handleSubmit}>发送</Button>
          </Button.Group>
        </Form.Field>
      </Form>
    );
  }

  return (
    <>
      <Comment.Group minimal className="max-h-72 overflow-auto !m-0">
        <Messages client={client} />
      </Comment.Group>

      <ChatForm />
    </>
  );
}