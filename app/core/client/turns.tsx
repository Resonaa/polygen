import { useEffect, useState } from "react";
import { Segment, Progress } from "semantic-ui-react";

import type { ClientSocket } from "~/core/types";

export function Turns({ client }: { client?: ClientSocket }) {
  const [turns, setTurns] = useState(-161);

  useEffect(() => {
    if (!client) {
      return;
    }

    client.on("gameStart", ({ turns }) => setTurns(turns))
      .on("patch", () => setTurns(turns => turns + 1))
      .on("win", () => setTurns(-161));
  }, [client]);

  return (
    <Segment inverted size="large">
      {turns > 0 &&
        <>
          回合 {turns}
          <Progress percent={turns % 25 * 4} attached="bottom" active indicating />
        </>}
    </Segment>
  );
}