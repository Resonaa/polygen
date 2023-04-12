import type { LoaderArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Menu, Table, Grid, Button } from "semantic-ui-react";

import { requireAuthenticatedUser } from "~/session.server";
import { Access } from "~/utils";
import { Map, MapMode } from "~/core/server/game/map";
import { Renderer } from "~/core/client/renderer";
import { LandType } from "~/core/server/game/land";
import type { Pos } from "~/core/server/game/utils";
import { getSettings, saveSettings, Settings } from "~/core/client/settings";

export async function loader({ request }: LoaderArgs) {
  return await requireAuthenticatedUser(request, Access.Settings);
}

export default function Keys() {
  const [mode, setMode] = useState(MapMode.Hexagon);

  useEffect(() => {
    const settings = getSettings();

    const canvas = document.createElement("canvas");
    document.querySelector(".equal > .column")?.appendChild(canvas);

    const renderer = new Renderer(canvas);

    const size = 7;
    const gm = new Map(size, size, mode);

    const selectHome: Pos = [(size + 1) / 2, (size + 1) / 2];
    const selectTopLeft: Pos = [1, 1];
    const splitArmy: Pos = [2, 2];
    const clearMovements: Pos = [2, 6];

    gm.get(selectHome).type = LandType.General;
    gm.get(selectHome).color = 1;

    for (let neighbour of gm.neighbours(selectHome)) {
      gm.get(neighbour).color = 2;
    }

    gm.get(selectTopLeft).color = 3;

    gm.get(splitArmy).color = 4;

    gm.get(clearMovements).color = 5;


    renderer.bind(gm, 0);

    const keys = settings.game.keys[mode];

    renderer.extraText(selectHome, keys.selectHome);
    renderer.extraText(splitArmy, keys.splitArmy);
    renderer.extraText(selectTopLeft, keys.selectTopLeft);
    renderer.extraText(clearMovements, keys.clearMovements);

    for (let [index, neighbour] of gm.neighbours(selectHome).entries()) {
      renderer.extraText(neighbour, keys.move[index]);
    }

    document.onkeydown = event => {
      event.preventDefault();

      if (event.repeat) {
        return;
      }

      const key = event.key === " " ? "Space" : event.key.toUpperCase();
      const pos = renderer.selected;

      if (!pos) {
        return;
      }

      let save = false;

      if (pos.join() === selectHome.join()) {
        keys.selectHome = key;
        save = true;
      } else if (pos.join() === selectTopLeft.join()) {
        keys.selectTopLeft = key;
        save = true;
      } else if (pos.join() === clearMovements.join()) {
        keys.clearMovements = key;
        save = true;
      } else if (pos.join() === splitArmy.join()) {
        keys.splitArmy = key;
        save = true;
      } else {
        for (let [index, neighbour] of gm.neighbours(selectHome).entries()) {
          if (neighbour.join() === pos.join()) {
            keys.move[index] = key;
            save = true;
            break;
          }
        }
      }

      if (save) {
        renderer.extraText(pos, key);
        saveSettings(settings);
      }
    };

    return () => {
      document.onkeydown = null;
      renderer.destroy();
    };
  }, [mode]);

  const headerRow = ["颜色", "描述", "默认值"];

  const defaultSettings = Settings.defaultSettings;

  const tableData = [["红色", "选家", defaultSettings.game.keys[mode].selectHome],
    ["蓝色", "移动", defaultSettings.game.keys[mode].move.toString()],
    ["绿色", "选择左上角领地", defaultSettings.game.keys[mode].selectTopLeft],
    ["青色", "半兵", defaultSettings.game.keys[mode].splitArmy],
    ["橙色", "清除全部移动", defaultSettings.game.keys[mode].clearMovements]];

  const resetToDefault = () => {
    let settings = getSettings();
    settings.game.keys[mode] = Settings.defaultSettings.game.keys[mode];
    saveSettings(settings);
    window.location.reload();
  };

  return (
    <div>
      <p>提示：选中领地，按下对应按键以修改键位，数据将自动更新。</p>

      <Menu text>
        <Menu.Item header>模式</Menu.Item>
        {Object.values(MapMode).map(name => (
          <Menu.Item key={name} name={name} active={mode === name} onClick={() => setMode(name as MapMode)} />
        ))}
      </Menu>

      <Grid stackable columns="equal">
        <Grid.Column height="300px" className="sm:mr-4" />

        <Grid.Column>
          <Table unstackable celled headerRow={headerRow} tableData={tableData}
                 renderBodyRow={(cells, key) => ({ cells, key })} />

          <Button negative onClick={resetToDefault}>恢复默认</Button>
        </Grid.Column>
      </Grid>
    </div>
  );
}