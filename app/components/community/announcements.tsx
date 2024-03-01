import { VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import Access, { access } from "~/access";
import { useOptionalUser } from "~/hooks/loader";

import AddAnnouncement from "./addAnnouncement";
import type { AnnouncementProps } from "./announcement";
import Announcement from "./announcement";

export default function Announcements({
  announcements
}: {
  announcements: AnnouncementProps[];
}) {
  const { i18n } = useTranslation();
  const user = useOptionalUser();

  const editable = access(user, Access.ManageAnnouncement);

  return (
    <VStack w="100%" spacing={2}>
      {announcements.map(data =>
        i18n.language === data.lang ? (
          <Announcement key={data.id} editable={editable} {...data} />
        ) : null
      )}

      {editable ? <AddAnnouncement /> : null}
    </VStack>
  );
}
