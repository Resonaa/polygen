import {
  useColorModeValue,
  Text,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";

import TextRenderer from "./textRenderer";

interface EditorProps {
  value: string;
  setValue: (value: string) => void;
}

export default function Editor<T extends EditorProps>({
  value,
  setValue,
  ...props
}: T) {
  const { t } = useTranslation();

  const tabs = [t("community.edit"), t("community.preview")];

  const tabHoverColor = useColorModeValue("blue.700", "blue.200");

  return (
    <Tabs w="100%" {...props}>
      <TabList border="none">
        {tabs.map(tab => (
          <Tab
            key={tab}
            border="none"
            _hover={{ color: tabHoverColor }}
            transitionDuration=".3s"
          >
            {tab}
          </Tab>
        ))}
      </TabList>

      <TabIndicator
        h="2px"
        bg={useColorModeValue("blue.600", "blue.300")}
        rounded="full"
        transitionDuration=".2s !important"
      />

      <TabPanels>
        <TabPanel px={0}>
          <Textarea
            as={TextareaAutosize}
            minH="4rem"
            maxH="14rem"
            resize="none"
            name="content"
            onChange={e => setValue(e.target.value)}
            placeholder={t("community.placeholder")}
            value={value}
          />
        </TabPanel>

        <TabPanel px={0}>
          {value.trim().length > 0 ? (
            <TextRenderer content={value} />
          ) : (
            <Text color="gray.500">{t("community.nothing-to-preview")}</Text>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
