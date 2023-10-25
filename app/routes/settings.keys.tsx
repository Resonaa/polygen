import type { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Menu, Table, Grid, Button } from "semantic-ui-react";

import Access from "~/access";
import { Renderer } from "~/core/client/renderer";
import { getSettings, saveSettings, Settings } from "~/core/client/settings";
import { LandType } from "~/core/server/game/land";
import { Map, MapMode } from "~/core/server/game/map";
import type { Pos } from "~/core/server/game/utils";
import { requireUser } from "~/session.server";
import { numberColorToString } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  return await requireUser(request, Access.Settings);
}

export default function Keys() {
  const [mode, setMode] = useState(MapMode.Hexagon);
  const [userColors, setUserColors] = useState(
    Settings.defaultSettings.game.colors.standard
  );

  useEffect(() => {
    const settings = getSettings();
    setUserColors(settings.game.colors.standard);

    const canvas = document.createElement("canvas");
    document.querySelector(".equal > .column")?.appendChild(canvas);

    const renderer = new Renderer(canvas);

    const size = 7;
    const gm = new Map(size, size, mode);

    const selectHome: Pos = [(size + 1) / 2, (size + 1) / 2];
    const selectTopLeft: Pos = [1, 1];
    const splitArmy: Pos = [2, 2];
    const clearMovements: Pos = [2, 6];
    const undoMovement: Pos = [6, 6];
    const surrender: Pos = [6, 2];

    gm.get(selectHome).type = LandType.General;
    gm.get(selectHome).color = 1;

    for (const neighbor of gm.neighbors(selectHome)) {
      gm.get(neighbor).color = 2;
    }

    gm.get(selectTopLeft).color = 3;
    gm.get(splitArmy).color = 4;
    gm.get(clearMovements).color = 5;
    gm.get(undoMovement).color = 6;
    gm.get(surrender).color = 7;

    renderer.bind(gm, 0);

    const keys = settings.game.keys[mode];

    renderer.extraText(selectHome, keys.selectHome);
    renderer.extraText(splitArmy, keys.splitArmy);
    renderer.extraText(selectTopLeft, keys.selectTopLeft);
    renderer.extraText(clearMovements, keys.clearMovements);
    renderer.extraText(undoMovement, keys.undoMovement);
    renderer.extraText(surrender, keys.surrender);

    for (const [index, neighbor] of gm.neighbors(selectHome).entries()) {
      renderer.extraText(neighbor, keys.move[index]);
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
      } else if (pos.join() === surrender.join()) {
        keys.surrender = key;
        save = true;
      } else if (pos.join() === undoMovement.join()) {
        keys.undoMovement = key;
        save = true;
      } else {
        for (const [index, neighbor] of gm.neighbors(selectHome).entries()) {
          if (neighbor.join() === pos.join()) {
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

  const defaultSettings = Settings.defaultSettings;

  const resetToDefault = () => {
    const settings = getSettings();
    settings.game.keys[mode] = defaultSettings.game.keys[mode];
    saveSettings(settings);
    window.location.reload();
  };

  const tableData = [
    ["选家", defaultSettings.game.keys[mode].selectHome],
    ["移动", defaultSettings.game.keys[mode].move.toString()],
    ["选择左上角领地", defaultSettings.game.keys[mode].selectTopLeft],
    ["半兵", defaultSettings.game.keys[mode].splitArmy],
    ["清除全部移动", defaultSettings.game.keys[mode].clearMovements],
    ["撤销一步移动", defaultSettings.game.keys[mode].undoMovement],
    ["投降", defaultSettings.game.keys[mode].surrender]
  ];

  return (
    <div>
      <p>提示：选中领地，按下对应按键以修改键位，数据将自动更新。</p>

      <Menu text>
        <Menu.Item header>模式</Menu.Item>
        {Object.values(MapMode).map(name => (
          <Menu.Item
            key={name}
            name={name}
            active={mode === name}
            onClick={() => setMode(name as MapMode)}
          />
        ))}
      </Menu>

      <Grid stackable columns="equal">
        <Grid.Column className="sm:mr-4" />

        <Grid.Column>
          <Table unstackable celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>颜色</Table.HeaderCell>
                <Table.HeaderCell>描述</Table.HeaderCell>
                <Table.HeaderCell>默认值</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tableData.map(([description, defaultValue], id) => (
                <Table.Row key={id}>
                  <Table.Cell
                    style={{
                      backgroundColor: numberColorToString(userColors[id + 1])
                    }}
                  />
                  <Table.Cell>{description}</Table.Cell>
                  <Table.Cell>{defaultValue}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <Button negative onClick={resetToDefault}>
            恢复默认
          </Button>
        </Grid.Column>
      </Grid>
    </div>
  );
}
