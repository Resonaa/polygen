import { Avatar, Tag, TagLabel } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

interface UserTagProps {
  username: string;
}

export default function UserTag<T extends UserTagProps>({
  username,
  ...props
}: T) {
  return (
    <Link to={`/user/${username}`} key={username}>
      <Tag borderRadius="full" {...props}>
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
