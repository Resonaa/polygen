import { Header, TextArea, Form, Button, Icon } from "semantic-ui-react";

export default function Index() {
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
        <TextArea rows={2} placeholder="导入/导出数据" />
      </Form>

      <Button.Group fluid className="!mt-4">
        <Button primary icon labelPosition="left">
          <Icon name="upload" />
          导出数据
        </Button>

        <Button negative icon labelPosition="left">
          <Icon name="download" />
          导入数据
        </Button>
      </Button.Group>
    </>
  );
}