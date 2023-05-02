import hljs from "highlight.js";
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

export function renderText(content: string) {
  return highlightRender(mathRender(md2html(content)));
}