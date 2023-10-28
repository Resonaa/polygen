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
  Tooltip
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import { formatDate, useRelativeDateFormatter } from "~/hooks/datetime";
import type { Announcement as AnnouncementType } from "~/models/announcement.server";

import TextRenderer from "./textRenderer";

type AnnouncementProps = Pick<
  AnnouncementType,
  "title" | "content" | "id" | "lang"
> & {
  createdAt: string;
};

function Announcement({
  id,
  title,
  content,
  lang,
  createdAt
}: AnnouncementProps) {
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
          <ModalHeader pb={0}>
            {title}
            <chakra.span color="gray.400" ml={2} fontWeight="normal">
              #{id}
            </chakra.span>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box color="gray.400" fontSize="sm">
              {lang} · {t("community.published")}&nbsp;
              <Tooltip label={formatDate(createdAt)} openDelay={500}>
                {relativeDate(createdAt)}
              </Tooltip>
            </Box>
            <Divider my={3} />
            <TextRenderer content={content} />
          </ModalBody>
          <ModalFooter>
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
  const { t } = useTranslation();

  return (
    <Center flexDir="column">
      <Heading mb={1} size="sm">
        {t("community.announcements")}
      </Heading>
      <VStack spacing={0}>
        {announcements.map(data => (
          <Announcement key={data.id} {...data} />
        ))}
      </VStack>
    </Center>
  );
}
