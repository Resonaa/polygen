import type { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Button, Form, Grid } from "semantic-ui-react";

import Access from "~/access";
import { Renderer } from "~/core/client/renderer";
import { saveSettings, Settings } from "~/core/client/settings";
import { LandType } from "~/core/server/game/land";
import { Map } from "~/core/server/game/map";
import { requireAuthenticatedUser } from "~/session.server";
import { numberColorToString, stringColorToNumber } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  return await requireAuthenticatedUser(request, Access.Settings);
}

export default function Colors() {
  const [curColor, setCurColor] = useState<number>();
  const [curId, setCurId] = useState<number>();
  const [renderer, setRenderer] = useState<Renderer>();

  const size = 4;

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      return;
    }

    const renderer = new Renderer(canvas);

    setRenderer(renderer);

    const gm = new Map(size, size);

    for (let i = 1; i <= size; i++) {
      for (let j = 1; j <= size; j++) {
        const id = (i - 1) * size + j;
        gm.get([i, j]).color = id;
        gm.get([i, j]).amount = id;
        gm.get([i, j]).type = LandType.General;
      }
    }

    renderer.bind(gm, 0);

    renderer.handleSelect = () => {
      const pos = renderer.selected;

      if (!pos) {
        return;
      }

      const id = (pos[0] - 1) * size + pos[1];
      setCurId(id);
      setCurColor(renderer.settings.game.colors.standard[id]);
    };

    return () => {
      renderer.destroy();
    };
  }, []);

  const resetAllToDefault = () => {
    if (!renderer) {
      return;
    }

    renderer.settings.game.colors.standard =
      Settings.defaultSettings.game.colors.standard;
    renderer.updateAll();
    saveSettings(renderer.settings);

    if (curId) {
      setCurColor(renderer.settings.game.colors.standard[curId]);
    }
  };

  const setCurColorAndSave = (color: number) => {
    if (!renderer || !curId) {
      return;
    }

    renderer.settings.game.colors.standard[curId] = color;
    renderer.updateGraphics([
      Math.ceil(curId / size),
      ((curId - 1) % size) + 1
    ]);
    saveSettings(renderer.settings);
    setCurColor(renderer.settings.game.colors.standard[curId]);
  };

  const resetToDefault = () =>
    setCurColorAndSave(
      Settings.defaultSettings.game.colors.standard[curId as number]
    );

  return (
    <div>
      <p>提示：选中领地以修改颜色，数据将自动更新。</p>

      <Grid stackable columns="equal">
        <Grid.Column className="sm:mr-4">
          <canvas height={200} />
        </Grid.Column>

        <Grid.Column>
          {curColor && (
            <Form className="mb-4">
              <Form.Field>
                修改颜色序号：{curId}
                <input
                  className="ml-4"
                  type="color"
                  value={numberColorToString(curColor)}
                  onChange={({ target }) => {
                    setCurColorAndSave(stringColorToNumber(target.value));
                  }}
                />
              </Form.Field>
              <Form.Field>
                <Button primary onClick={resetToDefault}>
                  恢复默认
                </Button>
              </Form.Field>
            </Form>
          )}
          <Button negative onClick={resetAllToDefault}>
            全部恢复默认
          </Button>
        </Grid.Column>
      </Grid>
    </div>
  );
}
