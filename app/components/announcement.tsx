import type { Announcement as ann } from "@prisma/client";
import { Modal, Button } from "semantic-ui-react";
import React from "react";
import RenderedText from "~/components/renderedText";

export default function Announcement({ title, content }: ann) {
  const [open, setOpen] = React.useState(false);

  /* eslint-disable jsx-a11y/anchor-is-valid */
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      trigger={<a className="cursor-pointer">{title}</a>}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content style={{ overflowWrap: "break-word" }}>
        <Modal.Description>
          <RenderedText content={content} />
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setOpen(false)}>
          关闭
        </Button>
      </Modal.Actions>
    </Modal>
  );
}