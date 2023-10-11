import { Avatar } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

export default function UserAvatar({ username }: { username: string }) {
  return (
    <Link to={`/user/${username}`}>
      <Avatar src={`/usercontent/avatar/${username}.avif`} />
    </Link>
  );
}
