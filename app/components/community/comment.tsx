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
  Link,
  Text,
  Tooltip,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { Link as ReactLink } from "@remix-run/react";
import { useRef, useState } from "react";

import Access, { access } from "~/access";
import type { Comment as CommentType } from "~/models/comment.server";
import { ajax, useOptionalUser, useServerTime } from "~/utils";

import RenderedText from "./renderedText";
import UserAvatar from "./userAvatar";
import { formatDate, relativeDate } from "./utils";

export type CommentProps = Pick<CommentType, "id" | "username" | "content"> & {
  createdAt: string
};

export default function Comment({ id, username, createdAt, content }: CommentProps) {
  const now = useServerTime();

  const user = useOptionalUser();
  const editable = user?.username === username || access(user, Access.ManageCommunity);

  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const cancelRef = useRef<HTMLButtonElement>(null);

  const onDeleteClick = () => {
    setLoading(true);
    ajax("post", "/api/comment/delete", { id }).then(data => {
      if (data === "删除成功") {
        window.location.reload();
      }
      setLoading(false);
    });
  };

  return (
    <VStack w="100%" spacing={2} align="normal">
      <Flex>
        <Flex flex={1} gap="10px" align="center" wrap="wrap">
          <UserAvatar username={username} />

          <Box>
            <Link as={ReactLink} to={`/user/${username}`} fontWeight={600} fontSize="lg">
              {username}
            </Link>
            <Tooltip label={formatDate(createdAt)}>
              <Text fontSize="sm" color="gray.400">
                评论于 {relativeDate(createdAt, now)}
              </Text>
            </Tooltip>
          </Box>
        </Flex>

        {
          editable && (
            <AlertDialog
              isOpen={isOpen}
              onClose={onClose}
              isCentered
              leastDestructiveRef={cancelRef}>
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader>确认删除</AlertDialogHeader>
                  <AlertDialogBody>删除后将无法找回评论内容</AlertDialogBody>
                  <AlertDialogFooter>
                    <Button onClick={onClose} ref={cancelRef}>取消</Button>
                    <Button colorScheme="red" onClick={onDeleteClick} ml={3} isLoading={loading}>
                      确认
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          )
        }

        {
          editable && (
            <Tooltip label="删除">
              <IconButton isRound aria-label="delete" variant="ghost"
                          onClick={onOpen} icon={<DeleteIcon />} />
            </Tooltip>
          )
        }
      </Flex>

      <Box maxH="200px" overflowY="auto">
        <object>
          <RenderedText content={content} />
        </object>
      </Box>
    </VStack>
  );
}