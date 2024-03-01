import { VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { load } from "~/hooks/loader";
import { POSTS_PER_PAGE } from "~/models/common";
import type { action } from "~/routes/api.post.page";

import LoadMore from "./loadMore";
import type { PostProps } from "./post";
import Post from "./post";

export default function Posts({ posts }: { posts: PostProps[] }) {
  const [extraPosts, setExtraPosts] = useState<PostProps[]>([]);

  const loader = async (page: number) => {
    const data = await load<typeof action>("/api/post/page", {
      page: page
    });

    setExtraPosts(extraPosts => extraPosts.concat(data));
    return data.length === POSTS_PER_PAGE;
  };

  return (
    <VStack w="100%" spacing={6}>
      <AnimatePresence initial={false} mode="popLayout">
        {posts.concat(extraPosts).map(data => (
          <motion.div
            transition={{ type: "spring" }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            initial={{ scale: 0.8, opacity: 0 }}
            key={data.cuid}
            style={{ width: "100%" }}
            layout
          >
            <Post linked {...data} />
          </motion.div>
        ))}
      </AnimatePresence>

      {posts.length === POSTS_PER_PAGE ? <LoadMore loader={loader} /> : null}
    </VStack>
  );
}
