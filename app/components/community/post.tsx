import { CheckIcon, CloseIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ButtonGroup,
  chakra,
  Flex,
  IconButton,
  Tooltip,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { Form, Link, useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import Access, { access } from "~/access";
import type { Post as PostType } from "~/models/post.server";
import { useOptionalUser } from "~/utils";

import Editor from "./editor";
import RenderedText from "./renderedText";
import UserAvatar from "./userAvatar";
import UserLink from "./userLink";
import {
  formatDate,
  formatLargeNumber,
  useRelativeDateFormatter
} from "./utils";

export type PostProps = Pick<
  PostType,
  "id" | "username" | "content" | "viewCount"
> & {
  _count: {
    comments: number;
  };
  createdAt: string;
};

export default function Post({
  id,
  username,
  createdAt,
  content,
  viewCount,
  _count: { comments },
  linked
}: PostProps & {
  linked: boolean;
}) {
  const postUrl = `/post/${id}`;

  const relativeDate = useRelativeDateFormatter();

  const user = useOptionalUser();
  const editable =
    user?.username === username || access(user, Access.ManageCommunity);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(content);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const editFetcher = useFetcher();

  const { t } = useTranslation();

  const onEditClick = () => {
    setEditing(true);
  };

  const onCancelClick = () => {
    setEditing(false);
    setValue(content);
  };

  useEffect(() => {
    if (editFetcher.state === "idle") {
      setEditing(false);
    }
  }, [editFetcher.state]);

  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <VStack align="normal" w="100%" spacing={2}>
      <Flex>
        <Flex align="center" wrap="wrap" flex={1} gap={3}>
          <UserAvatar username={username} />

          <Box>
            <UserLink username={username} />
            <Box color="gray.400" fontSize="sm">
              <Tooltip label={formatDate(createdAt)} openDelay={500}>
                {relativeDate(createdAt)}
              </Tooltip>
              <span>
                {" "}
                · {formatLargeNumber(viewCount)}{" "}
                {t("community.view", { count: viewCount })} ·{" "}
              </span>
              <span>
                {formatLargeNumber(comments)}{" "}
                {t("community.comment", { count: comments })}
              </span>
            </Box>
          </Box>
        </Flex>

        {editable && (
          <>
            {editing ? (
              <ButtonGroup
                as={editFetcher.Form}
                gap={1}
                m={0}
                action="/api/post/edit"
                method="post"
                variant="ghost"
              >
                <IconButton
                  aria-label="save"
                  colorScheme="green"
                  icon={<CheckIcon />}
                  isRound
                  type="submit"
                />
                <IconButton
                  aria-label="cancel"
                  colorScheme="red"
                  icon={<CloseIcon />}
                  isRound
                  onClick={onCancelClick}
                />
                <input type="hidden" name="content" value={value} />
                <input type="hidden" name="id" value={id} />
              </ButtonGroup>
            ) : (
              <ButtonGroup gap={1} variant="ghost">
                <IconButton
                  aria-label="edit"
                  icon={<EditIcon />}
                  isRound
                  onClick={onEditClick}
                />
                <IconButton
                  aria-label="delete"
                  icon={<DeleteIcon />}
                  isRound
                  onClick={onOpen}
                />
              </ButtonGroup>
            )}

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
                  <AlertDialogBody>
                    {t("community.confirm-body")}
                  </AlertDialogBody>
                  <AlertDialogFooter
                    as={Form}
                    m={0}
                    action="/api/post/delete"
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
                    <input type="hidden" name="id" value={id} />
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>
        )}
      </Flex>

      {editable && editing ? (
        <Editor value={value} setValue={setValue} />
      ) : linked ? (
        <chakra.a as={Link} to={postUrl} maxH="200px" overflowY="auto">
          <object>
            <RenderedText content={content} />
          </object>
        </chakra.a>
      ) : (
        <object>
          <RenderedText content={content} />
        </object>
      )}
    </VStack>
  );
}
