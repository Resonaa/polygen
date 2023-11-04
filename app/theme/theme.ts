import { extendTheme } from "@chakra-ui/react";

import Button from "./button";
import global from "./global";
import Input from "./input";
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
    Table
  }
});
