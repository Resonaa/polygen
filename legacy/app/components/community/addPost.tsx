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
    <Form method="post" style={{ width: "100%" }}>
      <Editor value={value} setValue={setValue} mb={4} />

      <Flex justify="flex-end" gap={4}>
        <Checkbox
          opacity={isDisabled ? 0 : 1}
          transform="auto"
          isChecked={isPrivate}
          onChange={setPrivate.toggle}
          transitionDuration=".5s"
          transitionProperty="opacity, transform"
          transitionTimingFunction="ease-in-out"
          translateX={isDisabled ? 90 : 0}
        >
          <Tooltip
            closeOnClick={false}
            label={t("community.privateModeDescription")}
            openDelay={500}
          >
            {t("community.privateMode")}
          </Tooltip>
        </Checkbox>

        <Button
          colorScheme="blue"
          isDisabled={isDisabled}
          isLoading={state !== "idle"}
          leftIcon={<BsFillSendFill />}
          type="submit"
        >
          {t("community.addPost")}
        </Button>
      </Flex>

      <input name="isPrivate" value={isPrivate.toString()} type="hidden" />
    </Form>
  );
}
