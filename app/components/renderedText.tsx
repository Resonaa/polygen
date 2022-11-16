import React, { useEffect, useRef } from "react";
import Vditor from "vditor";

export default function RenderedText({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const cur = ref.current;

      if (cur) {
        cur.innerHTML = await Vditor.md2html(content.trim(), {
          anchor: 2,
          math: {
            inlineDigit: true
          }
        } as IPreviewOptions);

        Vditor.mathRender(cur);
        Vditor.highlightRender({}, cur);
        Vditor.codeRender(cur);
      }
    })();
  }, [content]);

  return (
    <div ref={ref}>{content}</div>
  );
}