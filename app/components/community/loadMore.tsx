import { Center, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LoadMore({
  loader
}: {
  loader: (page: number) => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);

  const { t } = useTranslation();

  const loadMore = () => {
    if (loading || page === -1) {
      return;
    }

    setLoading(true);
    loader(page).then(visible => {
      setLoading(false);
      setPage(page => (visible ? page + 1 : -1));
    });
  };

  const hoverColor = useColorModeValue("gray.700", "gray.100");

  return (
    page !== -1 && (
      <Center
        w="100%"
        color="gray.400"
        fontSize="sm"
        _hover={loading ? undefined : { color: hoverColor }}
        cursor={loading ? undefined : "pointer"}
        transition="color .1s ease"
        onClick={loadMore}
      >
        {loading ? <Spinner /> : t("community.load-more")}
      </Center>
    )
  );
}
