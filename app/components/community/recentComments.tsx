import { Box, Center, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import type { Comment } from "~/models/comment.server";

import type { CommentProps } from "./comment";
import RenderedText from "./renderedText";
import UserLink from "./userLink";
import { useRelativeDateFormatter } from "./utils";

type RecentCommentProps = CommentProps & {
  parentId: Comment["parentId"]
}

function RecentComment({ username, createdAt, content, parentId }: RecentCommentProps) {
  const relativeDate = useRelativeDateFormatter();

  return (
    <VStack align="normal" w="100%" spacing={1}>
      <HStack justifyContent="space-between">
        <UserLink username={username} />
        <Text color="gray.400" fontSize="sm">
          {relativeDate(createdAt)}
        </Text>
      </HStack>

      <Box overflowY="auto" maxH="100px">
        <Link to={`/post/${parentId}`}>
          <object>
            <RenderedText content={content} />
          </object>
        </Link>
      </Box>
    </VStack>
  );
}

export default function RecentComments({ comments }: { comments: RecentCommentProps[] }) {
  const { t } = useTranslation();

  return (
    <Center flexDir="column" w="100%">
      <Heading mb={2} size="sm">{t("community.recent-comments")}</Heading>
      <VStack w="100%" spacing={0}>
        {comments.map(data => <RecentComment key={data.id} {...data} />)}
      </VStack>
    </Center>
  );
}