import { Comment, Label } from "semantic-ui-react";
import { useEffect, useRef, useState } from "react";

import type { Message } from "~/core/server/message";
import { MessageType } from "~/core/server/message";
import { UserLink } from "~/components/community";
import RenderedText from "~/components/renderedText";
import type { ClientSocket } from "~/core/types";

function GameMessage({ type, content, username }: Pick<Message, "type" | "content" | "username">) {
  return (
    <Comment className="!p-0">
      <Comment.Content>
        {type !== MessageType.Room &&
          (<Label color={type === MessageType.World ? "blue" : "orange"}
                  size="mini" circular empty className="!ml-2" />)
        }
        <UserLink username={username} />
        <Comment.Text className="!inline">
          <RenderedText content={content} mode="dark" className="inline-block !ml-2" />
        </Comment.Text>
      </Comment.Content>
    </Comment>
  );
}

function Time({ time }: { time: number }) {
  const date = new Date(time);
  const hours = date.getHours(), minutes = date.getMinutes();

  function format(input: number) {
    return input <= 9 ? "0" + input : input.toString();
  }

  return <div className="text-center text-sm time">{format(hours) + ":" + format(minutes)}</div>;
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
    if (delta <= 100)
      scrollDown();
    else
      setNewCount(newCount => newCount + 1);
  }, [delta, messages]);

  useEffect(() => {
    client
      ?.off("message")
      ?.on("message", ({ username, content, type }) => {
        const e = document.getElementsByClassName("comments")[0];
        setDelta(e.scrollHeight - e.scrollTop - e.clientHeight);

        setPreviousTime(previousTime => {
          const curTime = new Date().getTime(), deltaTime = curTime - previousTime;

          if (deltaTime >= 1000 * 60 * 5) { // 5 min
            setMessages(messages => messages.concat([<Time key={messages.length} time={curTime} />,
              <GameMessage key={messages.length} username={username}
                           content={content} type={type} />]));
            return curTime;
          } else {
            setMessages(messages => messages.concat(<GameMessage key={messages.length} username={username}
                                                                 content={content} type={type} />));
            return previousTime;
          }
        });
      });
  }, [client]);

  return (
    <>
      {messages}

      <div ref={messageEnd} className="h-2" />
      {newCount > 0 &&
        (<Label color="red" floating onClick={scrollDown} className="cursor-pointer"
                title={`${newCount}条未读消息`}>
          +{newCount}
        </Label>)}
    </>
  );
}