import type { ModalProps, TransitionProps } from "semantic-ui-react";
import { Modal, Transition } from "semantic-ui-react";

export default function AnimatedModal(props: ModalProps & TransitionProps) {
  return (
    <>
      {props.trigger}
      <Transition
        visible={props.open}
        animation="fade up"
        duration={props.duration}
      >
        <Modal
          open={props.open}
          onOpen={props.onOpen}
          onClose={props.onClose}
          size={props.size}
          basic={props.basic}
        >
          {props.children}
        </Modal>
      </Transition>
    </>
  );
}
