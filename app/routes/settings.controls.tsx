import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Dropdown } from "semantic-ui-react";

import Access from "~/access";
import { Controls, getSettings, saveSettings, Settings } from "~/core/client/settings";
import { requireAuthenticatedUser } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await requireAuthenticatedUser(request, Access.Settings);
}

export default function SettingsControls() {
  const [controls, setControls] = useState(Settings.defaultSettings.game.controls);

  useEffect(() => setControls(getSettings().game.controls), []);

  const options = Object.values(Controls).map(control => ({ key: control, value: control, text: control }));

  return (
    <div>
      <div>
        选择控制方式：
        <Dropdown selection value={controls} options={options}
                  onChange={(_, { value }) => {
                    setControls(value as Controls);
                    const settings = getSettings();
                    settings.game.controls = value as Controls;
                    saveSettings(settings);
                  }} />
      </div>
      <div className="mt-4">
        提示：
        {controls === Controls.Keyboard ?
          (
            <>您可能需要<Link to="/settings/keys">设置键位</Link></>
          ) : controls === Controls.Touch ? (
            <>点击相邻地块移动，双击半兵</>
          ) : (
            <>根据屏幕大小自动选择控制方式</>
          )
        }
      </div>
    </div>
  );
}