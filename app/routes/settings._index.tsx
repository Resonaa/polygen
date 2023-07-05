import { useEffect, useState } from "react";
import { Header, TextArea, Form, Button, Icon } from "semantic-ui-react";

import { getSettings, SETTINGS_KEY } from "~/core/client/settings";

export default function Index() {
  const [settings, setSettings] = useState("");

  function exportSettings() {
    getSettings();
    const settings = localStorage.getItem(SETTINGS_KEY);
    setSettings(settings ? settings : "");
  }

  useEffect(exportSettings, []);

  return (
    <>
      <Header as="h4">个人设置</Header>

      <p>
        <strong>所有设置数据保存在本地，清空浏览器缓存会导致数据丢失。</strong>
      </p>
      <p>
        若您有备份数据的需要，可以在下方导入/导出数据：
      </p>

      <Form>
        <TextArea rows={3} value={settings} placeholder="导入/导出数据"
                  onChange={(_, { value }) => setSettings(value as string)} />
      </Form>

      <Button.Group fluid className="!mt-4">
        <Button primary icon labelPosition="left" onClick={exportSettings}>
          <Icon name="upload" />
          导出数据
        </Button>

        <Button negative icon labelPosition="left" onClick={() => {
          localStorage.setItem(SETTINGS_KEY, settings);
          window.location.reload();
        }}>
          <Icon name="download" />
          导入数据
        </Button>
      </Button.Group>
    </>
  );
}