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
  useDisclosure
} from "@chakra-ui/react";
import { Form, Link, useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import Access, { access } from "~/access";
import { formatDate, useRelativeDateFormatter } from "~/hooks/datetime";
import { useOptionalUser } from "~/hooks/loader";
import type { Post as PostType } from "~/models/post.server";

import Editor from "./editor";
import TextRenderer from "./textRenderer";
import UserAvatar from "./userAvatar";
import UserLink from "./userLink";
import { formatLargeNumber } from "./utils";

export type PostProps = Pick<PostType, "id" | "username" | "content"> & {
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

  const submitting = editFetcher.state !== "idle";

  useEffect(() => {
    if (!submitting) {
      setEditing(false);
    }
  }, [submitting]);

  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Flex direction="column" w="100%" role="group">
      <Flex mb={2}>
        <Flex align="center" wrap="wrap" flex={1} gap={3}>
          <UserAvatar username={username} />

          <Box>
            <UserLink username={username} />
            <Box color="gray.400" fontSize="xs">
              <Tooltip label={formatDate(createdAt)} openDelay={500}>
                {relativeDate(createdAt)}
              </Tooltip>
              {comments ? (
                <span>
                  {" · "}
                  {formatLargeNumber(comments)}{" "}
                  {t("community.comment", { count: comments })}
                </span>
              ) : null}
            </Box>
          </Box>
        </Flex>

        {editable ? (
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
                  isLoading={submitting}
                  type="submit"
                />
                <IconButton
                  aria-label="cancel"
                  colorScheme="red"
                  icon={<CloseIcon />}
                  onClick={onCancelClick}
                />

                <input type="hidden" name="content" value={value} />
                <input type="hidden" name="id" value={id} />
              </ButtonGroup>
            ) : (
              <ButtonGroup
                gap={1}
                opacity={0}
                _groupHover={{ opacity: "100%" }}
                transition="opacity .25s ease-in-out"
                variant="ghost"
              >
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
        ) : null}
      </Flex>

      {editable && editing ? (
        <Editor value={value} setValue={setValue} />
      ) : linked ? (
        <chakra.a as={Link} to={postUrl} maxH="200px" overflowY="auto">
          <object>
            <TextRenderer>{content}</TextRenderer>
          </object>
        </chakra.a>
      ) : (
        <TextRenderer>{content}</TextRenderer>
      )}
    </Flex>
  );
}
