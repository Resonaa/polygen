import type { FlexProps } from "@chakra-ui/react";
import { Flex, Textarea, Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";

import TextRenderer from "./textRenderer";

interface EditorProps extends FlexProps {
  value: string;
  setValue: (value: string) => void;
}

export default function Editor({ value, setValue, ...props }: EditorProps) {
  const { t } = useTranslation();

  const hasValue = value.trim().length > 0;

  return (
    <Flex justify="space-between" {...props}>
      <Textarea
        as={TextareaAutosize}
        flex={1}
        minH="4rem"
        maxH="14rem"
        fontFamily="mono"
        resize="none"
        name="content"
        onChange={e => setValue(e.target.value)}
        placeholder={t("community.placeholder")}
        rounded="none"
        value={value}
        variant="flushed"
      />

      <Box
        overflow="auto"
        w={hasValue ? "calc(50% - 16px)" : 0}
        maxH="14rem"
        ml={hasValue ? 4 : 0}
        py={2}
        transition="width .2s"
      >
        <TextRenderer>{value}</TextRenderer>
      </Box>
    </Flex>
  );
}
