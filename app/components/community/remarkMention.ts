import type { PhrasingContent, Root } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import type { Plugin } from "unified";

const user =
  "[^  @][\u4e00-\u9fa5a-zA-Z0-9_\\-\\\\!$%^&*()=+[\\]{}|:;'\",.<>`~ ]{1,16}[^  @]";
const mentionRegex = new RegExp("(?<=[^@]|^)@(@*)(" + user + ")\\1", "g");

const plugin: Plugin<[], Root> = () => {
  return tree => {
    findAndReplace(tree, mentionRegex, replaceMention);
    findAndReplace(tree, /@{2,}/g, "@");
  };

  function replaceMention(
    _value: string,
    _matched: string,
    username: string
  ): PhrasingContent[] {
    return [
      {
        type: "link",
        url: `/at?${username}`,
        children: []
      }
    ];
  }
};

export default plugin;
