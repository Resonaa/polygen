import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  chakra,
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
  Tooltip,
  useDisclosure
} from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDate, useRelativeDateFormatter } from "~/hooks/datetime";
import type { Announcement as AnnouncementType } from "~/models/announcement.server";

import Editor from "./editor";
import TextRenderer from "./textRenderer";

export type AnnouncementProps = Pick<
  AnnouncementType,
  "title" | "content" | "id" | "lang"
> & {
  createdAt: string;
};

function DeleteButton({ id }: { id: number }) {
  const { t } = useTranslation();
  const { Form } = useFetcher();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button colorScheme="red" onClick={onOpen}>
        {t("community.delete")}
      </Button>

      <AlertDialog
        isCentered
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              {t("community.confirm-title")}
            </AlertDialogHeader>

            <AlertDialogBody>{t("community.confirm-body")}</AlertDialogBody>

            <AlertDialogFooter
              as={Form}
              m={0}
              action="/api/announcement/delete"
              method="post"
            >
              <Button ref={cancelRef} onClick={onClose}>
                {t("community.cancel")}
              </Button>

              <Button ml={3} colorScheme="red" onClick={onClose} type="submit">
                {t("community.delete")}
              </Button>

              <input type="hidden" value={id} name="id" />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default function Announcement({
  id,
  title,
  content,
  lang,
  createdAt,
  editable
}: AnnouncementProps & { editable: boolean }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();

  const relativeDate = useRelativeDateFormatter();

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(content);
  const [newTitle, setNewTitle] = useState(title);

  const { state, Form } = useFetcher();

  const onEditClick = () => {
    setEditing(true);
  };

  const onCancelClick = () => {
    setEditing(false);
    setValue(content);
  };

  const onTitleChange = (s: string) => {
    setNewTitle(s);
  };

  const submitting = state !== "idle";
  const disabled = newTitle.trim().length === 0 || value.trim().length === 0;

  useEffect(() => {
    if (!submitting) {
      setEditing(false);
    }
  }, [submitting]);

  return (
    <>
      <Button w="100%" fontWeight="normal" onClick={onOpen} variant="link">
        {title}
      </Button>

      <Modal
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalOverlay />

        <ModalContent>
          <ModalHeader mb={2} pb={0}>
            {editing ? (
              <Editable
                display="inline"
                defaultValue={title}
                onChange={onTitleChange}
                placeholder={t("community.title")}
                startWithEditView={false}
                value={newTitle}
              >
                <EditablePreview />
                <EditableInput maxW="50%" maxLength={50} />
              </Editable>
            ) : (
              title
            )}

            <chakra.span
              color="gray.400"
              ml={2}
              fontFamily="mono"
              fontWeight="normal"
            >
              #{id}
            </chakra.span>
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody pt={0}>
            <Box color="gray.400" fontSize="xs">
              {lang} · {t("community.published")}&nbsp;
              <Tooltip label={formatDate(createdAt)} openDelay={500}>
                {relativeDate(createdAt)}
              </Tooltip>
            </Box>

            <Divider my={3} />

            {editing ? (
              <Editor value={value} setValue={setValue} />
            ) : (
              <TextRenderer>{content}</TextRenderer>
            )}
          </ModalBody>

          <ModalFooter
            as={Form}
            gap={3}
            action="/api/announcement/edit"
            method="post"
          >
            {editing ? (
              <>
                <Button
                  colorScheme="green"
                  isDisabled={disabled}
                  isLoading={submitting}
                  type="submit"
                >
                  {t("community.save")}
                </Button>
                <Button onClick={onCancelClick}>{t("community.cancel")}</Button>

                <input type="hidden" name="title" value={newTitle} />
                <input type="hidden" name="content" value={value} />
                <input type="hidden" name="id" value={id} />
              </>
            ) : editable ? (
              <>
                <DeleteButton id={id} />
                <Button colorScheme="blue" onClick={onEditClick}>
                  {t("community.edit")}
                </Button>
              </>
            ) : null}
            <Button onClick={onClose}>{t("community.close")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
