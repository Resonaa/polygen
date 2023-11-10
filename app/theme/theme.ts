import { extendTheme } from "@chakra-ui/react";

import Button from "./button";
import Code from "./code";
import global from "./global";
import Input from "./input";
import Link from "./link";
import Menu from "./menu";
import Modal from "./modal";
import Table from "./table";
import Tag from "./tag";
import Textarea from "./textarea";
import Tooltip from "./tooltip";

export default extendTheme({
  styles: {
    global
  },
  components: {
    Modal,
    Input,
    Button,
    Menu,
    Textarea,
    Tooltip,
    Tag,
    Table,
    Code,
    Link
  },
  fonts: {
    heading: "'Noto Sans SC Variable', -apple-system, system-ui, sans-serif",
    body: "'Noto Sans SC Variable', -apple-system, system-ui, sans-serif",
    mono: "'Noto Sans Mono Variable', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  colors: {
    star: "#ffd700"
  }
});
