/* eslint-disable jsx-a11y/anchor-is-valid */
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import parser from "socket.io-msgpack-parser";
import { useLoaderData } from "@remix-run/react";
import { Comment, Grid, Tab, Form, Select, Button } from "semantic-ui-react";

import { requireAuthenticatedUser } from "~/session.server";
import { setClient } from "~/core/client";
import { Access } from "~/utils";
import { catchTheCat } from "~/core/client/catchTheCat";
import type { Message } from "~/core/server/message";
import { MessageType } from "~/core/server/message";
import GameMessage from "~/components/gameMessage";

import game from "~/styles/game.css";

export function links() {
  return [{ rel: "stylesheet", href: game }];
}

export function meta() {
  return {
    title: "游戏 - polygen"
  };
}

export async function loader({ request, params }: LoaderArgs) {
  await requireAuthenticatedUser(request, Access.PlayGame);

  return json(params.rid);
}

export default function Rid() {
  const [socket, setSocket] = useState<Socket>();
  const rid = useLoaderData<typeof loader>();

  useEffect(() => {
    const socket = io({ parser });

    setSocket(socket);

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    setClient(socket, rid);
  }, [rid, socket]);

  useEffect(catchTheCat, []);

  function Messages() {
    const messageEnd = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [delta, setDelta] = useState(0);

    useEffect(() => {
      if (delta <= 50)
        messageEnd.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });

    useEffect(() => {
      socket
        ?.off("message")
        ?.on("message", (message: Message) => {
          const e = document.getElementsByClassName("comments")[0];
          setDelta(e.scrollHeight - e.scrollTop - e.clientHeight);

          setMessages(messages => messages.concat(message));
        });
    }, []);

    return (
      <>
        {
          messages.map(({ type, content, username, time }, index) => (
            <GameMessage type={type} username={username} time={time} content={content} key={index} />
          ))
        }

        <div ref={messageEnd} className="h-1" />
      </>
    );
  }

  function ChatForm() {
    const options = [
      { key: MessageType.Room, text: MessageType.Room, value: MessageType.Room },
      { key: MessageType.World, text: MessageType.World, value: MessageType.World },
      { key: MessageType.Team, text: MessageType.Team, value: MessageType.Team }
    ];

    const [type, setType] = useState(MessageType.Room);
    const [content, setContent] = useState("");

    const contentRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
      if (content.trim().length <= 0 || content.length > 161)
        return;

      socket?.emit("message", { type, content });
      setContent("");
      contentRef.current?.blur();
    };

    return (
      <Form inverted>
        <Form.Field>
            <textarea rows={3} placeholder="输入聊天内容" className="!text-white !bg-black" value={content}
                      ref={contentRef} onChange={event => setContent(event.target.value)} />
        </Form.Field>

        <Form.Field inline>
          <Select options={options} defaultValue={MessageType.Room} compact className="select-none"
                  onChange={(_, data) => setType(data.value as MessageType)} />
          <Button primary inverted onClick={handleSubmit}>发送</Button>
        </Form.Field>
      </Form>
    );
  }

  function Chat() {
    return (
      <>
        <Comment.Group minimal className="max-h-80 overflow-auto !m-0">
          <Messages />
        </Comment.Group>

        <ChatForm />
      </>
    );
  }

  const panes = [
    {
      menuItem: "聊天区",
      pane: { key: "聊天区", inverted: true, attached: false, content: <Chat /> }
    },
    { menuItem: "玩家列表", render: () => <Tab.Pane attached={false} inverted>Tab 2 Content</Tab.Pane> },
    { menuItem: "房间信息", render: () => <Tab.Pane attached={false} inverted>Tab 3 Content</Tab.Pane> }
  ];

  return (
    <Grid stackable container className="!m-0" style={{ width: "100% !important" }}>
      <Grid.Column width={12}>
        <div id="catch-the-cat" className="flex justify-center" />
      </Grid.Column>

      <Grid.Column width={4}>
        <Tab menu={{ secondary: true, pointing: true, inverted: true }} panes={panes} renderActiveOnly={false} />
      </Grid.Column>
    </Grid>
  );
}