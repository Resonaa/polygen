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
      if (!cur) {
        return;
      }

      if (mode === "light") {
        await Vditor.preview(cur, content, { mode, hljs: { style: "autumn" }, math: { inlineDigit: true } });
      } else {
        cur.innerHTML = await Vditor.md2html(content.trim(), { mode, math: { inlineDigit: true } });

        Vditor.mathRender(cur);
        Vditor.highlightRender({ style: "autumn" }, cur);
        Vditor.codeRender(cur);
      }
    })();
  }, [content, mode]);

  return (
    <div ref={ref} className={className}>{content}</div>
  );
}