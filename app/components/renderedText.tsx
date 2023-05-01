import clsx from "clsx";
import hljs from "vditor/dist/js/highlight.js/highlight.pack";
import katex from "vditor/dist/js/katex/katex.min";
import "vditor/dist/js/lute/lute.min";

const lute = (() => {
  const lute = Lute.New();
  lute.SetInlineMathAllowDigitAfterOpenMarker(true);
  lute.SetSanitize(true);
  return lute;
})();

function md2html(content: string) {
  return lute.Md2HTML(content);
}

function mathRender(html: string) {
  return html.replace(/<div class="language-math">(.*?)<\/div>/g, (_, inner) =>
    `<div class="language-math">${katex.renderToString(inner, { displayMode: true, throwOnError: false })}</div>`
  ).replace(/<span class="language-math">(.*?)<\/span>/g, (_, inner) =>
    `<span class="language-math">${katex.renderToString(inner, { throwOnError: false })}</span>`
  );
}

function decodeHTML(html: string) {
  return html.replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"");
}

function highlightRender(html: string) {
  return html.replace(/<pre><code(.*?)>([^]*?)<\/code><\/pre>/g, (_, className, code) => {
    code = decodeHTML(code);
    if (className.length === 0) {
      return `<pre><code class="hljs">${hljs.highlightAuto(code).value}</code></pre>`;
    } else {
      const language = className.substring(className.indexOf("-") + 1, className.length - 1);
      if (hljs.getLanguage(language)) {
        return `<pre><code class="hljs">${hljs.highlight(code, { language }).value}</code></pre>`;
      } else {
        return `<pre><code class="hljs">${hljs.highlightAuto(code).value}</code></pre>`;
      }
    }
  });
}

export default function RenderedText({
                                       content,
                                       mode,
                                       className
                                     }: { content: string, mode: "light" | "dark", className?: string }) {
  let html = md2html(content);
  html = mathRender(html);
  html = highlightRender(html);

  return (
    <div className={clsx(className, mode === "light" && "vditor-reset")}
         dangerouslySetInnerHTML={{ __html: html }} />
  );
}