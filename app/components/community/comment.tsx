import { DeleteIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  Tooltip,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import Access, { access } from "~/access";
import { formatDate, useRelativeDateFormatter } from "~/hooks/datetime";
import { useOptionalUser } from "~/hooks/loader";
import type { Comment as CommentType } from "~/models/comment.server";

import TextRenderer from "./textRenderer";
import UserAvatar from "./userAvatar";
import UserLink from "./userLink";

export type CommentProps = Pick<CommentType, "id" | "username" | "content"> & {
  createdAt: string;
};

export default function Comment({
  id,
  username,
  createdAt,
  content
}: CommentProps) {
  const relativeDate = useRelativeDateFormatter();

  const user = useOptionalUser();
  const editable =
    user?.username === username || access(user, Access.ManageCommunity);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const cancelRef = useRef<HTMLButtonElement>(null);

  const { Form } = useFetcher();

  const { t } = useTranslation();

  return (
    <VStack align="normal" w="100%" role="group" spacing={2}>
      <Flex>
        <Flex align="center" wrap="wrap" flex={1} gap={3}>
          <UserAvatar username={username} />

          <Box>
            <UserLink username={username} />
            <Tooltip label={formatDate(createdAt)} openDelay={500}>
              <Text color="gray.400" fontSize="sm">
                {relativeDate(createdAt)}
              </Text>
            </Tooltip>
          </Box>
        </Flex>

        {editable ? (
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
                  action="/api/comment/delete"
                  method="post"
                >
                  <Button ref={cancelRef} onClick={onClose}>
                    {t("community.cancel")}
                  </Button>
                  <Button
                    ml={3}
                    colorScheme="red"
                    onClick={onClose}
                    type="submit"
                  >
                    {t("community.delete")}
                  </Button>
                  <input type="hidden" value={id} name="id" />
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        ) : null}

        {editable ? (
          <IconButton
            opacity={0}
            _groupHover={{ opacity: "100%" }}
            transition="opacity .25s ease-in-out"
            aria-label="delete"
            icon={<DeleteIcon />}
            isRound
            onClick={onOpen}
            variant="ghost"
          />
        ) : null}
      </Flex>

      <Box overflowY="auto" maxH="200px">
        <TextRenderer content={content} />
      </Box>
    </VStack>
  );
}
