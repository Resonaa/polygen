import { Center, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

export default function LoadMore({ loader }: {
  loader: (page: number) => Promise<boolean>
}) {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);

  const loadMore = () => {
    if (loading || page === -1) {
      return;
    }

    setLoading(true);
    loader(page).then(visible => {
      setLoading(false);
      setPage(page => visible ? page + 1 : -1);
    });
  };

  const hoverColor = useColorModeValue("gray.700", "gray.100");

  return page !== -1 && (
    <Center w="100%" fontSize="sm" color="gray.400" transition="color .1s ease"
            _hover={loading ? undefined : { color: hoverColor }}
            cursor={loading ? undefined : "pointer"} onClick={loadMore}>
      {loading ? <Spinner /> : "点击查看更多..."}
    </Center>
  );
}