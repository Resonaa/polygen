import { VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { load } from "~/hooks/loader";
import { COMMENTS_PER_PAGE } from "~/models/common";
import type { action } from "~/routes/api.post.comment";

import type { CommentProps } from "./comment";
import Comment from "./comment";
import LoadMore from "./loadMore";

export default function Comments({
  comments,
  parentCuid
}: {
  comments: CommentProps[];
  parentCuid: string;
}) {
  const [extraComments, setExtraComments] = useState<CommentProps[]>([]);

  const loader = async (page: number) => {
    const data = await load<typeof action>("/api/post/comment", {
      page,
      parentCuid
    });
    setExtraComments(extraComments => extraComments.concat(data));
    return data.length === COMMENTS_PER_PAGE;
  };

  return (
    <VStack w="100%" spacing={3}>
      <AnimatePresence initial={false} mode="popLayout">
        {comments.concat(extraComments).map(data => (
          <motion.div
            transition={{ type: "spring" }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            initial={{ scale: 0.8, opacity: 0 }}
            key={data.id}
            style={{ width: "100%" }}
            layout
          >
            <Comment {...data} />
          </motion.div>
        ))}
      </AnimatePresence>

      {comments.length === COMMENTS_PER_PAGE ? (
        <LoadMore loader={loader} />
      ) : null}
    </VStack>
  );
}
