import { Link } from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";

import type { User } from "~/models/user.server";

export default function UserLink({ username }: Pick<User, "username">) {
  return (
    <Link as={RemixLink} fontWeight={600} to={`/user/${username}`}>
      {username}
    </Link>
  );
}
