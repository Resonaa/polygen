import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const renderer = ChakraUIRenderer();

interface RenderedTextProps {
  content: string;
}

export default function TextRenderer<T extends RenderedTextProps>({
  content,
  ...props
}: T) {
  return (
    <ReactMarkdown
      components={renderer}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeKatex, { output: "html", throwOnError: false }],
        [rehypeHighlight, { ignoreMissing: true }]
      ]}
      {...props}
    >
      {content}
    </ReactMarkdown>
  );
}
