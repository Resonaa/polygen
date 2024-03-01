import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

import PrivateIndicator from "~/components/community/privateIndicator";
import { useRelativeDateFormatter } from "~/hooks/datetime";
import type { Comment } from "~/models/comment.server";

import UserLink from "../user/userLink";

import type { CommentProps } from "./comment";
import TextRenderer from "./textRenderer";

type RecentCommentProps = CommentProps &
  Pick<Comment, "parentCuid"> & {
    parent: {
      username: string;
    };
  };

function RecentComment({
  username,
  createdAt,
  content,
  parentCuid,
  isPrivate,
  parent: { username: to }
}: RecentCommentProps) {
  const relativeDate = useRelativeDateFormatter();

  return (
    <VStack align="normal" w="100%" spacing={1}>
      <HStack justifyContent="space-between">
        <Flex align="center" gap={1}>
          <UserLink username={username} />

          <ChevronRightIcon />

          <UserLink fontWeight="normal" username={to} />
        </Flex>

        <Flex color="gray.400" fontSize="xs">
          <PrivateIndicator isPrivate={isPrivate} />

          <span>{relativeDate(createdAt)}</span>
        </Flex>
      </HStack>

      <Box overflowY="auto" maxH="100px">
        <Link to={`/post/${parentCuid}`}>
          <object>
            <TextRenderer>{content}</TextRenderer>
          </object>
        </Link>
      </Box>
    </VStack>
  );
}

export default function RecentComments({
  comments
}: {
  comments: RecentCommentProps[];
}) {
  return (
    <VStack w="100%" spacing={2}>
      {comments.map(data => (
        <RecentComment key={data.id} {...data} />
      ))}
    </VStack>
  );
}
