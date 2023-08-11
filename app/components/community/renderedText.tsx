import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export default function RenderedText({ content, ...props }: {
  content: string
}) {
  return (
    <ReactMarkdown
      components={ChakraUIRenderer()}
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[[rehypeKatex, { output: "html", throwOnError: false }],
        [rehypeHighlight, { ignoreMissing: true }]]}
      skipHtml
      children={content}
      {...props}
    />
  );
}