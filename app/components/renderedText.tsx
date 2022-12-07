import React, { useEffect, useRef } from "react";
import Vditor from "vditor";

export default function RenderedText({
                                       content,
                                       mode,
                                       className
                                     }: { content: string, mode: "light" | "dark", className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const cur = ref.current;

      if (cur) {
        cur.innerHTML = await Vditor.md2html(content.trim(), {
          mode,
          anchor: 2,
          math: {
            inlineDigit: true
          }
        });

        const style = mode === "light" ? "autumn" : "monokai";

        Vditor.mathRender(cur);
        Vditor.highlightRender({ style }, cur);
        Vditor.codeRender(cur);
      }
    })();
  }, [content, mode]);

  return (
    <div ref={ref} className={className}>{content}</div>
  );
}