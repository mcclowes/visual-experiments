import PropTypes from "prop-types";
import React from "react";
import ReactModal from "react-modal";

import Actions from "./Actions";
import Close from "./Close";
import Content from "./Content";
import Header from "./Header";
import Inner from "./Inner";

import "./modal.css";

// Set app element only in browser with #root (not in Storybook or tests)
if (typeof window !== "undefined" && document.getElementById("root")) {
  ReactModal.setAppElement("#root");
}

const Modal = props => {
  const { children, doClose, open, closeIcon, trigger } = props;

  return (
    <>
      {trigger && trigger}

      <div onClick={e => e.stopPropagation()}>
        <ReactModal
          isOpen={open}
          closeTimeoutMS={400}
          shouldCloseOnEsc={true}
          shouldCloseOnOverlayClick={true}
          onRequestClose={doClose}
          className="modal-wrapper"
          overlayClassName="modal-overlay"
        >
          {closeIcon && doClose && <Close onClick={doClose} />}

          {children}
        </ReactModal>
      </div>
    </>
  );
};

Modal.Actions = Actions;
Modal.Close = Close;
Modal.Content = Content;
Modal.Header = Header;
Modal.Inner = Inner;

Modal.propTypes = {
  children: PropTypes.node,
  closeIcon: PropTypes.bool,
  doClose: PropTypes.func,
  open: PropTypes.bool,
  trigger: PropTypes.any
};

export default Modal;
