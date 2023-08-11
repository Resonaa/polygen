import { Button } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BsFillSendFill } from "react-icons/bs";

import Editor from "./editor";

export default function AddPost() {
  const fetcher = useFetcher();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (fetcher.state === "idle") {
      setValue("");
    }
  }, [fetcher.state]);

  return (
    <fetcher.Form method="post" style={{ width: "100%" }}>
      <Editor value={value} setValue={setValue} mt="-4px" />
      <Button type="submit" leftIcon={<BsFillSendFill />} colorScheme="blue"
              isLoading={fetcher.state !== "idle"}>
        发布
      </Button>
    </fetcher.Form>
  );
}