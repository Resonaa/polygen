import hljs from "highlight.js";
import type { KatexOptions } from "katex";
import katex from "katex";
import "vditor/dist/js/lute/lute.min";

declare class Lute {
  static New: () => any;
}

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
  const options: KatexOptions = {
    output: "html",
    throwOnError: false
  };

  return html.replace(/<div class="language-math">([\s\S]*?)<\/div>/g, (_, inner) =>
    `<div class="language-math">${katex.renderToString(decodeHTML(inner), { displayMode: true, ...options })}</div>`
  ).replace(/<span class="language-math">(.*?)<\/span>/g, (_, inner) =>
    `<span class="language-math">${katex.renderToString(decodeHTML(inner), options)}</span>`
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

export function renderText(content: string) {
  return highlightRender(mathRender(md2html(content)));
}

export function validatePostContent(content: unknown): content is string {
  return !(typeof content !== "string" || content.length <= 0 || content.length >= 100000);
}