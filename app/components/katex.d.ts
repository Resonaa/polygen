declare module "vditor/dist/js/katex/katex.min" {
  export interface KatexOptions {
    displayMode?: boolean | undefined;
    throwOnError?: boolean | undefined;
  }

  export default class katex {
    static renderToString(tex: string, options?: KatexOptions): string;
  }
}