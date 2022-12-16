import { Label } from "semantic-ui-react";
import { Fragment, useEffect, useRef, useState } from "react";

import type { Message } from "~/core/server/message";
import { MessageType } from "~/core/server/message";
import { UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";
import type { ClientSocket } from "~/core/types";

export function getColorByMessageType(type: MessageType) {
  if (type === MessageType.World)
    return "green";
  else if (type === MessageType.Room)
    return "blue";
  else
    return "orange";
}

function GameMessage({ type, content, username }: Pick<Message, "type" | "content" | "username">) {
  return (
    <div>
      <UserLink username={username} style={{ color: "light" + getColorByMessageType(type) }} />
      <RenderedText content={content} mode="dark" className="inline-block !ml-2" />
    </div>
  );
}

function Info({ content }: { content: string }) {
  return <div className="text-center text-sm info">{content}</div>;
}

function Time({ time }: { time: number }) {
  const date = new Date(time);
  const hours = date.getHours(), minutes = date.getMinutes();

  function format(input: number) {
    return input <= 9 ? "0" + input : input.toString();
  }

  return <Info content={format(hours) + ":" + format(minutes)} />;
}

export function Messages({ client }: { client?: ClientSocket }) {
  const messageEnd = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<JSX.Element[]>([]);
  const [delta, setDelta] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [, setPreviousTime] = useState(0);

  const scrollDown = () => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setNewCount(0);
  };

  useEffect(() => {
    if (delta <= 80)
      scrollDown();
    else
      setNewCount(newCount => newCount + 1);
  }, [delta, messages]);

  const updateMessageList = (content: JSX.Element) => {
    const messages = document.getElementsByClassName("messages")[0];
    setDelta(messages.scrollHeight - messages.scrollTop - messages.clientHeight);

    setPreviousTime(previousTime => {
      const curTime = new Date().getTime(), deltaTime = curTime - previousTime;

      if (deltaTime >= 1000 * 60 * 5) { // 5 min
        setMessages(messages => messages.concat([<Time key={messages.length} time={curTime} />,
          <Fragment key={messages.length + 1}>{content}</Fragment>]));
        return curTime;
      } else {
        setMessages(messages => messages.concat(<Fragment key={messages.length}>{content}</Fragment>));
        return previousTime;
      }
    });
  };

  useEffect(() => {
    client
      ?.off("message")
      ?.on("message", ({ username, content, type }) => {
        updateMessageList(<GameMessage type={type} username={username} content={content} />);
      })
      ?.off("info")
      ?.on("info", info => {
        updateMessageList(<Info content={info} />);
      });
  }, [client]);

  return (
    <>
      {messages}

      <div ref={messageEnd} className="h-2" />
      {newCount > 0 &&
        (<Label color="red" circular size="small" floating onClick={scrollDown} className="cursor-pointer"
                title={`${newCount}条新消息`}>
          {newCount}
        </Label>)}
    </>
  );
}