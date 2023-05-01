declare module "vditor/dist/js/highlight.js/highlight.pack" {
  export type HLJSApi = PublicApi;

  interface PublicApi {
    highlight: (codeOrLanguageName: string, optionsOrCode: HighlightOptions) => HighlightResult;
    highlightAuto: (code: string) => AutoHighlightResult;
    getLanguage: (languageName: string) => Language | undefined;
  }

  export interface HighlightResult {
    value: string;
  }

  export interface AutoHighlightResult extends HighlightResult {
  }

  export interface HighlightOptions {
    language: string;
  }

  const hljs: HLJSApi;
  export default hljs;
}

