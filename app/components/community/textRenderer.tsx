import { Link } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import type { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import UserTag from "~/components/community/userTag";

import remarkMention from "./remarkMention";

const renderer = ChakraUIRenderer();

export default function TextRenderer({
  children,
  ...props
}: ReactMarkdownOptions) {
  return (
    <ReactMarkdown
      components={{
        ...renderer,
        a: props => {
          const href = props.href;
          if (href?.startsWith("/at?")) {
            return <UserTag username={decodeURIComponent(href.substring(4))} />;
          }

          return <Link {...props} />;
        }
      }}
      remarkPlugins={[remarkGfm, remarkMath, remarkMention]}
      rehypePlugins={[[rehypeKatex, { output: "html", throwOnError: false }]]}
      {...props}
    >
      {children}
    </ReactMarkdown>
  );
}
