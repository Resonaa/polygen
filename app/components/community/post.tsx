import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
  HStack,
  Icon,
  IconButton,
  Link,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import { Link as ReactLink, useLocation, useNavigate } from "@remix-run/react";
import { memo, useRef, useState } from "react";
import { FaComment, FaEye } from "react-icons/fa6";

import Access, { access } from "~/access";
import type { Post as PostType } from "~/models/post.server";
import { ajax, useOptionalUser, useServerTime } from "~/utils";

import Editor from "./editor";
import RenderedText from "./renderedText";
import UserAvatar from "./userAvatar";
import { formatDate, formatLargeNumber, relativeDate } from "./utils";

export type PostProps = Pick<PostType, "id" | "username" | "content" | "viewCount"> & {
  _count: {
    comments: number
  },
  createdAt: string
};

// eslint-disable-next-line react/display-name
const PostSource = memo(({ content }: Pick<PostProps, "content">) =>
  (
    <Accordion allowToggle reduceMotion>
      <AccordionItem border="none">
        <AccordionButton w="unset" m="auto" fontSize="sm" justifyContent="center"
                         color="gray.400" p={0}
                         _hover={{
                           color: useColorModeValue("gray.700", "gray.100"),
                           bg: "unset"
                         }}
                         transition="color .1s ease">
          <Text>源代码</Text>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel px={0} pb={0}>
          <RenderedText content={`~~~markdown\n${content}\n~~~`} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
);

export default function Post({ id, username, createdAt, content, viewCount, _count: { comments }, linked }: PostProps &
  { linked: boolean }) {
  const postUrl = `/post/${id}`;
  const metaColor = useColorModeValue("gray.500", "gray.300");
  const metaHoverColor = useColorModeValue("gray.700", "gray.100");
  const metaTransition = "color .1s ease";

  const now = useServerTime();

  const user = useOptionalUser();
  const editable = user?.username === username || access(user, Access.ManageCommunity);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(content);

  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();
  const location = useLocation();

  const onEditClick = () => {
    setEditing(true);
  };

  const onCancelClick = () => {
    setEditing(false);
    setValue(content);
  };

  const onSaveClick = () => {
    setLoading(true);
    ajax("post", "/api/post/edit", { id, content: value }).then(data => {
      if (data === "编辑成功") {
        navigate(location.pathname);
        setEditing(false);
      }
      setLoading(false);
    });
  };

  const cancelRef = useRef<HTMLButtonElement>(null);

  const onDeleteClick = () => {
    setLoading(true);
    ajax("post", "/api/post/delete", { id }).then(data => {
      if (data === "删除成功") {
        navigate("/");
      } else {
        setLoading(false);
      }
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
                发布于 {relativeDate(createdAt, now)}
              </Text>
            </Tooltip>
          </Box>
        </Flex>

        {
          editable && (
            editing ? (
              <ButtonGroup spacing={2} variant="ghost">
                <Button colorScheme="blue" onClick={onSaveClick}
                        isLoading={loading}>
                  保存
                </Button>
                <Button onClick={onCancelClick}>取消</Button>
              </ButtonGroup>
            ) : (
              <>
                <ButtonGroup variant="ghost">
                  <Tooltip label="编辑">
                    <IconButton isRound aria-label="edit" onClick={onEditClick} icon={<EditIcon />} />
                  </Tooltip>
                  <Tooltip label="删除">
                    <IconButton isRound aria-label="delete" onClick={onOpen} icon={<DeleteIcon />} />
                  </Tooltip>
                </ButtonGroup>

                <AlertDialog
                  isOpen={isOpen}
                  onClose={onClose}
                  isCentered
                  leastDestructiveRef={cancelRef}>
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader>确认删除</AlertDialogHeader>
                      <AlertDialogBody>删除后将无法找回说说内容</AlertDialogBody>
                      <AlertDialogFooter>
                        <Button onClick={onClose} ref={cancelRef}>取消</Button>
                        <Button colorScheme="red" onClick={onDeleteClick} ml={3} isLoading={loading}>
                          确认
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
              </>
            )
          )
        }
      </Flex>

      {
        editing ? (
            <Editor value={value} setValue={setValue} />
          ) :
          linked ? (
            <chakra.a as={ReactLink} to={postUrl} maxH="200px" overflowY="auto">
              <object>
                <RenderedText content={content} />
              </object>
            </chakra.a>
          ) : (
            <object>
              <RenderedText content={content} />
            </object>
          )
      }

      {
        !linked && !editing && <PostSource content={content} />
      }

      <HStack spacing={7} color={metaColor} fontSize="sm">
        <Flex as={linked ? ReactLink : undefined} to={postUrl} transition={metaTransition}
              _hover={{ color: metaHoverColor }} align="center">
          <Icon as={FaEye} mr="3px" />
          {formatLargeNumber(viewCount)} 浏览
        </Flex>

        <Flex as={linked ? ReactLink : undefined} to={postUrl} transition={metaTransition}
              _hover={{ color: metaHoverColor }} align="center">
          <Icon as={FaComment} mr="3px" />
          {comments} 评论
        </Flex>
      </HStack>
    </VStack>
  );
}