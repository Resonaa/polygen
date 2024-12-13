import { LockIcon, UnlockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import type { InputProps } from "@chakra-ui/react";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement
} from "@chakra-ui/react";
import type { ComponentProps } from "react";
import { useState } from "react";

export default function PasswordInputGroup(
  props: Omit<InputProps & ComponentProps<"input">, "type">
) {
  const [show, setShow] = useState(false);
  const onClick = () => setShow(show => !show);

  return (
    <InputGroup>
      <InputLeftElement>
        {show ? <UnlockIcon /> : <LockIcon />}
      </InputLeftElement>
      <Input
        pr={12}
        paddingInlineStart="40px"
        type={show ? "text" : "password"}
        {...props}
      />
      <InputRightElement w={14} pointerEvents="auto">
        <IconButton
          aria-label="toggle show"
          icon={show ? <ViewOffIcon /> : <ViewIcon />}
          onClick={onClick}
          size="sm"
          variant="ghost"
        />
      </InputRightElement>
    </InputGroup>
  );
}
