import { Tab, TabList, TabPanel, TabPanels, Tabs, Textarea } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";

import RenderedText from "./renderedText";

interface EditorProps {
  value: string,
  setValue: (value: string) => void
}

export default function Editor<T extends EditorProps>({ value, setValue, ...props }: T) {
  const { t } = useTranslation();

  return (
    <Tabs w="100%" {...props}>
      <TabList border="none">
        <Tab>{t("community.edit")}</Tab>
        <Tab>{t("community.preview")}</Tab>
      </TabList>

      <TabPanels>
        <TabPanel px={0}>
          <Textarea
            as={TextareaAutosize}
            minH="4rem"
            resize="none"
            name="content"
            onChange={e => setValue(e.target.value)}
            required
            rows={2}
            value={value}
          />
        </TabPanel>
        <TabPanel px={0}>
          <RenderedText content={value} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}