import { useState } from "react";
import { Button, Modal } from "semantic-ui-react";

import AnimatedModal from "~/components/animatedModal";
import RenderedText from "~/components/renderedText";
import type { Announcement as ann } from "~/models/announcement.server";

export default function Announcement({ id, title, content }: ann) {
  const [open, setOpen] = useState(false);

  /* eslint-disable jsx-a11y/anchor-is-valid */
  return (
    <AnimatedModal
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      trigger={<a className="cursor-pointer block p-1" onClick={() => setOpen(true)}>{title}</a>}
      duration={300}
    >
      <Modal.Header>
        {title}
        <span className="font-light text-slate-400"> #{id}</span>
      </Modal.Header>
      <Modal.Content scrolling style={{ overflowWrap: "break-word" }}>
        <Modal.Description>
          <RenderedText html={content} mode="light" />
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setOpen(false)}>
          关闭
        </Button>
      </Modal.Actions>
    </AnimatedModal>
  );
}