import {
  Button,
  Center,
  chakra,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack
} from "@chakra-ui/react";

import RenderedText from "~/components/community/renderedText";
import type { Announcement as AnnouncementType } from "~/models/announcement.server";

type AnnouncementProps = Pick<AnnouncementType, "title" | "content" | "id">;

function Announcement({ id, title, content }: AnnouncementProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button variant="ghost" size="md" fontWeight="normal" onClick={onOpen}>{title}</Button>

      <Modal isCentered size="2xl" scrollBehavior="inside" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {title}
            <chakra.span color="gray.400" ml={2}>#{id}</chakra.span>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RenderedText content={content} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function Announcements({ announcements }: { announcements: AnnouncementProps[] }) {
  return (
    <Center flexDir="column">
      <Heading size="sm" mb={1}>公告</Heading>
      <VStack spacing={0}>
        {announcements.map(data => (
          <Announcement key={data.id} {...data} />
        ))}
      </VStack>
    </Center>
  );
}