import { Tab } from "semantic-ui-react";

import type { ClientSocket } from "~/core/types";

// noinspection JSUnusedLocalSymbols
function Game({ client }: { client?: ClientSocket }) {
  return (
    <>
      游戏
    </>
  );
}

export function GamePanel({ client }: { client?: ClientSocket }) {
  const panes = [
    {
      menuItem: "游戏",
      pane: { key: "游戏", content: <Game client={client} />, inverted: true, attached: false }
    }];

  return (
    <Tab panes={panes} renderActiveOnly={false} menu={{ inverted: true, secondary: true, pointing: true }} />
  );
}