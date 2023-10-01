import {
  Box,
  Button,
  Center,
  chakra,
  Divider,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import RenderedText from "~/components/community/renderedText";
import { formatDate, useRelativeDateFormatter } from "~/components/community/utils";
import type { Announcement as AnnouncementType } from "~/models/announcement.server";

type AnnouncementProps = Pick<AnnouncementType, "title" | "content" | "id" | "lang"> & {
  createdAt: string
};

function Announcement({ id, title, content, lang, createdAt }: AnnouncementProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();

  const relativeDate = useRelativeDateFormatter();

  return (
    <>
      <Button fontWeight="normal" onClick={onOpen} variant="ghost">{title}</Button>

      <Modal isCentered isOpen={isOpen} onClose={onClose} scrollBehavior="inside" size="2xl">
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
            <RenderedText content={content} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>
              {t("community.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function Announcements({ announcements }: { announcements: AnnouncementProps[] }) {
  const { t } = useTranslation();

  return (
    <Center flexDir="column">
      <Heading mb={1} size="sm">{t("community.announcements")}</Heading>
      <VStack spacing={0}>
        {announcements.map(data => (
          <Announcement key={data.id} {...data} />
        ))}
      </VStack>
    </Center>
  );
}