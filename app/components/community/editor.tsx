import { Tab, TabList, TabPanel, TabPanels, Tabs, Textarea } from "@chakra-ui/react";
import TextareaAutosize from "react-textarea-autosize";

import RenderedText from "./renderedText";

export default function Editor({ value, setValue, ...props }: {
  value: string,
  setValue: (value: string) => void
} & any) {
  return (
    <Tabs w="100%" {...props}>
      <TabList border="none">
        <Tab>编辑</Tab>
        <Tab>预览</Tab>
      </TabList>

      <TabPanels>
        <TabPanel px={0}>
          <Textarea
            as={TextareaAutosize}
            rows={2}
            resize="none"
            minH="4rem"
            required
            name="content"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </TabPanel>
        <TabPanel px={0}>
          <RenderedText content={value} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}