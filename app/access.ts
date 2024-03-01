/**
 * Access to use in polygen.
 */
export default class Access {
  static Basic = 0;

  static Community = 1;
  static Gaming = 1;
  static Settings = 1;

  static ManageCommunity = 2;
  static ManageAccess = 2;

  static ManageAnnouncement = 3;
  static ManageUser = 3;
  static ManageGame = 3;

  static ManageServer = 4;
  static ManageDb = 4;
}

/**
 * Something that has access. Maybe a user.
 */
interface HasAccess {
  readonly access: number;
}

/**
 * Whether a user reaches a particular access level.
 */
export function access(user: HasAccess | undefined | null, access: number) {
  return (user?.access ?? 0) >= access;
}
