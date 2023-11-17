import { Avatar, Tag, TagLabel, chakra } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

interface UserTagProps {
  username: string;
}

export default function UserTag<T extends UserTagProps>({
  username,
  ...props
}: T) {
  return (
    <chakra.a as={Link} to={`/user/${username}`} display="inline-block">
      <Tag
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
