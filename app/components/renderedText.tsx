import React, { useEffect, useRef } from "react";
import Vditor from "vditor";

export default function RenderedText({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      if (ref.current) {
        ref.current.innerHTML = await Vditor.md2html(content.trim(), {
          anchor: 2,
          math: {
            inlineDigit: true
          }
        } as IPreviewOptions);

        Vditor.mathRender(ref.current);
        Vditor.highlightRender({}, ref.current);
        Vditor.codeRender(ref.current);
      }
    })();
  }, [content]);

  return (
    <div ref={ref}></div>
  );
}