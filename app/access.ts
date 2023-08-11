const enum Access {
  Basic = 0,

  Community = 1,
  Gaming = 1,
  Settings = 1,

  ManageCommunity = 2,
  ManageAccess = 2,

  ManageAnnouncement = 3,
  ManageUser = 3,
  ManageGame = 3,

  ManageServer = 4,
  ManageDb = 4,
}

export default Access;

interface HasAccess {
  access: number;
}

export function access(user: HasAccess | undefined | null, access: Access) {
  return (user?.access ?? 0) >= access;
}