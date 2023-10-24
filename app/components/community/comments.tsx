import { VStack } from "@chakra-ui/react";
import { useState } from "react";

import { ajax } from "~/utils";

import type { CommentProps } from "./comment";
import Comment from "./comment";
import LoadMore from "./loadMore";

export default function Comments({
  comments,
  parentId
}: {
  comments: CommentProps[];
  parentId: number;
}) {
  const [extraComments, setExtraComments] = useState<CommentProps[]>([]);

  const loader = async (page: number) => {
    const data = await ajax("post", "/api/post/comment", { page, parentId });
    setExtraComments(extraComments => extraComments.concat(data));
    return data.length === 10;
  };

  return (
    <VStack w="100%" spacing={3}>
      {comments.concat(extraComments).map(data => (
        <Comment key={data.id} {...data} />
      ))}
      {comments.length === 10 ? <LoadMore loader={loader} /> : null}
    </VStack>
  );
}
