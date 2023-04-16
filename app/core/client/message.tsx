import { Label } from "semantic-ui-react";
import { Fragment, useEffect, useRef, useState } from "react";

import type { Message } from "~/core/server/message";
import { MessageType } from "~/core/server/message";
import RenderedText from "~/components/renderedText";
import type { ClientSocket } from "~/core/types";

export function getColorByMessageType(type: MessageType) {
  if (type === MessageType.World)
    return "green";
  else if (type === MessageType.Room)
    return "blue";
  else
    return "salmon";
}

function GameMessage({ type, content, sender }: Pick<Message, "type" | "content" | "sender">) {
  return (
    <div>
      <a href={`/user/${sender}`} style={{ color: "light" + getColorByMessageType(type) }}>{sender}</a>
      <RenderedText content={content} mode="dark" className="inline-block !ml-2" />
    </div>
  );
}

function Info({ content }: { content: string }) {
  return <div className="text-center text-xs info">{content}</div>;
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
    messageEnd.current?.scrollIntoView(false);
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

    if (messages)
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
    if (!client) {
      return;
    }

    client
      .on("message", ({ sender, content, type }) => updateMessageList(<GameMessage content={content} type={type}
                                                                                   sender={sender} />))
      .on("info", info => updateMessageList(<Info content={info} />))
      .on("disconnect", () => updateMessageList(<Info content={"连接断开"} />))
      .on("win", winnerStr => updateMessageList(<Info content={winnerStr + "赢了"} />))
      .on("die", () => updateMessageList(<Info content="您死了" />));
  }, [client]);

  return (
    <>
      {messages}

      <div ref={messageEnd} className="h-1" />
      {newCount > 0 &&
        (<Label color="red" circular size="small" floating onClick={scrollDown} className="cursor-pointer"
                title={`${newCount}条新消息`}>
          {newCount}
        </Label>)}
    </>
  );
}