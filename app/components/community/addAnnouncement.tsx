import { SmallAddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Editor from "./editor";

export default function AddAnnouncement() {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const { t, i18n } = useTranslation();

  const { Form, state } = useFetcher();

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const submitting = state !== "idle";
  const disabled = title.trim().length === 0 || content.trim().length === 0;

  const lang = i18n.language;

  useEffect(() => {
    if (!submitting) {
      setTitle("");
      setContent("");
      onClose();
    }
  }, [submitting, onClose]);

  const onTitleChange = (s: string) => {
    setTitle(s);
  };

  return (
    <>
      <Button
        w="100%"
        leftIcon={<SmallAddIcon />}
        onClick={onOpen}
        variant="link"
      >
        {t("community.add-announcement")}
      </Button>

      <Modal
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalOverlay />

        <ModalContent as={Form} action="/api/announcement/create" method="post">
          <ModalHeader mb={2} pb={0}>
            <Editable
              mr={8}
              defaultValue=""
              onChange={onTitleChange}
              placeholder={t("community.title")}
              startWithEditView={false}
              value={title}
            >
              <EditablePreview />
              <EditableInput maxLength={50} name="title" required />
            </Editable>
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody pt={0}>
            <Box color="gray.400" fontSize="xs">
              {lang}
            </Box>

            <Divider my={3} />

            <Editor value={content} setValue={setContent} />
          </ModalBody>

          <ModalFooter gap={3}>
            <Button
              colorScheme="green"
              isDisabled={disabled}
              isLoading={submitting}
              type="submit"
            >
              {t("community.publish")}
            </Button>

            <Button onClick={onClose}>{t("community.cancel")}</Button>

            <input type="hidden" name="lang" value={lang} />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
