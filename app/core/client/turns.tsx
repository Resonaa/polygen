import { useEffect, useState } from "react";
import { Segment } from "semantic-ui-react";

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
    <Segment inverted size="large" className="!px-[14px] !py-[10px]">
      {turns > 0 && <>回合 {turns}</>}
    </Segment>
  );
}