import { Box, Center, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { Link as ReactLink } from "@remix-run/react/dist/components";

import type { Comment } from "~/models/comment.server";
import { useServerTime } from "~/utils";

import type { CommentProps } from "./comment";
import RenderedText from "./renderedText";
import { relativeDate } from "./utils";

type RecentCommentProps = CommentProps & {
  parentId: Comment["parentId"]
}

function RecentComment({ username, createdAt, content, parentId }: RecentCommentProps) {
  const now = useServerTime();

  return (
    <VStack w="100%" spacing={1} align="normal">
      <HStack justifyContent="space-between">
        <Link as={ReactLink} to={`/user/${username}`} fontWeight={600}>
          {username}
        </Link>
        <Text fontSize="sm" color="gray.400">
          {relativeDate(createdAt, now)}
        </Text>
      </HStack>

      <Box maxH="100px" overflowY="auto">
        <ReactLink to={`/post/${parentId}`}>
          <object>
            <RenderedText content={content} />
          </object>
        </ReactLink>
      </Box>
    </VStack>
  );
}

export default function RecentComments({ comments }: { comments: RecentCommentProps[] }) {
  return (
    <Center flexDir="column" w="100%">
      <Heading size="sm" mb={2}>最新评论</Heading>
      <VStack w="100%" spacing={0}>
        {comments.map(data => <RecentComment key={data.id} {...data} />)}
      </VStack>
    </Center>
  );
}