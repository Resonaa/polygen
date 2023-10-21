import { Text } from "@chakra-ui/layout";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const renderer = ChakraUIRenderer();

interface RenderedTextProps {
  content: string;
}

export default function RenderedText<T extends RenderedTextProps>({
  content,
  ...props
}: T) {
  const { t } = useTranslation();

  return content.trim().length > 0 ? (
    <ReactMarkdown
      components={renderer}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeKatex, { output: "html", throwOnError: false }],
        [rehypeHighlight, { ignoreMissing: true }]
      ]}
      skipHtml
      children={content}
      {...props}
    />
  ) : (
    <Text color="gray.500">{t("community.nothing-to-preview")}</Text>
  );
}
