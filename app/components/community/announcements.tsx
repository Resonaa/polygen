import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  Center,
  Heading,
  Divider,
  VStack,
  useDisclosure,
  Button,
  chakra,
  Tooltip,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import Access, { access } from "~/access";
import AddAnnouncement from "~/components/community/addAnnouncement";
import { formatDate, useRelativeDateFormatter } from "~/hooks/datetime";
import { useOptionalUser } from "~/hooks/loader";
import type { Announcement as AnnouncementType } from "~/models/announcement.server";

import TextRenderer from "./textRenderer";

type AnnouncementProps = Pick<
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

function Announcement({
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

  return (
    <>
      <Button fontWeight="normal" onClick={onOpen} variant="ghost">
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
            {title}
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
            <TextRenderer>{content}</TextRenderer>
          </ModalBody>
          <ModalFooter gap={3}>
            {editable ? (
              <>
                <DeleteButton id={id} />
                <Button colorScheme="blue">{t("community.edit")}</Button>
              </>
            ) : null}
            <Button onClick={onClose}>{t("community.close")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function Announcements({
  announcements
}: {
  announcements: AnnouncementProps[];
}) {
  const { t, i18n } = useTranslation();
  const user = useOptionalUser();

  const editable = access(user, Access.ManageAnnouncement);

  return (
    <Center flexDir="column">
      <Heading mb={1} size="sm">
        {t("community.announcements")}
      </Heading>
      <VStack spacing={0}>
        {announcements.map(data =>
          i18n.language === data.lang ? (
            <Announcement key={data.id} editable={editable} {...data} />
          ) : null
        )}

        {editable ? <AddAnnouncement /> : null}
      </VStack>
    </Center>
  );
}
