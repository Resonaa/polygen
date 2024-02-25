import { Button, Flex, Checkbox, useBoolean, Tooltip } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsFillSendFill } from "react-icons/bs";

import Editor from "./editor";

export default function AddPost() {
  const { state, Form } = useFetcher();
  const [value, setValue] = useState("");
  const [isPrivate, setPrivate] = useBoolean();
  const { t } = useTranslation();

  useEffect(() => {
    if (state === "idle") {
      setValue("");
      setPrivate.off();
    }
  }, [state, setPrivate]);

  const isDisabled = value.trim().length === 0;

  return (
    <Form method="post" role="group" style={{ width: "100%" }}>
      <Editor value={value} setValue={setValue} mb={4} />

      <Flex justify="flex-end" gap={4}>
        <Checkbox
          opacity={isPrivate ? 1 : 0}
          _groupHover={{ opacity: 1 }}
          transition="opacity .25s ease-in-out"
          isChecked={isPrivate}
          isDisabled={isDisabled}
          onChange={setPrivate.toggle}
        >
          <Tooltip
            closeOnClick={false}
            label={t("community.description-private")}
            openDelay={500}
          >
            {t("community.private-mode")}
          </Tooltip>
        </Checkbox>

        <Button
          colorScheme="blue"
          isDisabled={isDisabled}
          isLoading={state !== "idle"}
          leftIcon={<BsFillSendFill />}
          type="submit"
        >
          {t("community.add-post")}
        </Button>
      </Flex>

      <input name="isPrivate" value={isPrivate.toString()} type="hidden" />
    </Form>
  );
}
