import { VStack } from "@chakra-ui/react";
import { useState } from "react";

import { load } from "~/hooks/loader";
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
    return data.length === 10;
  };

  return (
    <VStack w="100%" spacing={5}>
      {posts.concat(extraPosts).map(data => (
        <Post key={data.id} linked {...data} />
      ))}
      {posts.length === 10 ? <LoadMore loader={loader} /> : null}
    </VStack>
  );
}
