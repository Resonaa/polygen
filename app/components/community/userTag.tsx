import type { TagProps } from "@chakra-ui/react";
import { Avatar, Tag, TagLabel } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

interface UserTagProps extends TagProps {
  username: string;
}

export default function UserTag({ username, ...props }: UserTagProps) {
  return (
    <Link to={`/user/${username}`}>
      <Tag verticalAlign="middle" {...props}>
        <Avatar
          mr={1}
          size="2xs"
          src={`/usercontent/avatar/${username}.avif`}
        />
        <TagLabel>{username}</TagLabel>
      </Tag>
    </Link>
  );
}
