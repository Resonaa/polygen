import type { TagProps } from "@chakra-ui/react";
import { Avatar, Tag, TagLabel, chakra } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

interface UserTagProps extends TagProps {
  username: string;
}

export default function UserTag({ username, ...props }: UserTagProps) {
  return (
    <chakra.a as={Link} to={`/user/${username}`} display="inline-block">
      <Tag
        fontSize="inherit"
        fontWeight="inherit"
        textDecoration="inherit"
        rounded="full"
        {...props}
      >
        <Avatar
          mr={1}
          size="2xs"
          src={`/usercontent/avatar/${username}.avif`}
        />
        <TagLabel>{username}</TagLabel>
      </Tag>
    </chakra.a>
  );
}
