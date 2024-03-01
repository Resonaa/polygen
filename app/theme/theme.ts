import { extendTheme } from "@chakra-ui/react";

import Avatar from "./avatar";
import Button from "./button";
import Code from "./code";
import Input from "./input";
import Menu from "./menu";
import Modal from "./modal";
import Table from "./table";
import Tag from "./tag";
import Textarea from "./textarea";
import Tooltip from "./tooltip";

export default extendTheme({
  components: {
    Avatar,
    Modal,
    Input,
    Button,
    Menu,
    Textarea,
    Tooltip,
    Tag,
    Table,
    Code
  },
  fonts: {
    heading: "'Noto Sans SC Variable', -apple-system, system-ui, sans-serif",
    body: "'Noto Sans SC Variable', -apple-system, system-ui, sans-serif",
    mono: "'Fira Code Variable', system-ui"
  },
  colors: {
    star: "#ffd700"
  }
});
