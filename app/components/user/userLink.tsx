import type { LinkProps } from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";

interface UserLinkProps extends LinkProps {
  username: string;
}

export default function UserLink({ username, ...props }: UserLinkProps) {
  return (
    <Link as={RemixLink} fontWeight={600} to={`/user/${username}`} {...props}>
      {username}
    </Link>
  );
}
