import { Box, Center, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { useRelativeDateFormatter } from "~/hooks/datetime";
import type { Comment } from "~/models/comment.server";

import type { CommentProps } from "./comment";
import TextRenderer from "./textRenderer";
import UserLink from "./userLink";

type RecentCommentProps = CommentProps & Pick<Comment, "parentCuid">;

function RecentComment({
  username,
  createdAt,
  content,
  parentCuid
}: RecentCommentProps) {
  const relativeDate = useRelativeDateFormatter();

  return (
    <VStack align="normal" w="100%" spacing={1}>
      <HStack justifyContent="space-between">
        <UserLink username={username} />
        <Text color="gray.400" fontSize="xs">
          {relativeDate(createdAt)}
        </Text>
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
  const { t } = useTranslation();

  return (
    <Center flexDir="column" w="100%">
      <Heading mb={2} size="sm">
        {t("community.recent-comments")}
      </Heading>
      <VStack w="100%" spacing={1}>
        {comments.map(data => (
          <RecentComment key={data.id} {...data} />
        ))}
      </VStack>
    </Center>
  );
}
