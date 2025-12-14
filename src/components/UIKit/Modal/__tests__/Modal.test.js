import Modal from "../Modal";
import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReactModal from "react-modal";

// Set app element for react-modal in tests
ReactModal.setAppElement(document.createElement("div"));

const ContentMock = () => {
  return <div>This is in a portal</div>;
};

const ModalWrapper = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(!open)}>Trigger</button>

      <Modal
        open={open}
        doClose={() => setOpen(false)}
        closeIcon={true}
        {...props}
      >
        <ContentMock />
      </Modal>
    </div>
  );
};

describe("Modal", () => {
  it("interaction", () => {
    const { baseElement } = render(<ModalWrapper />);

    // Modal should not be visible initially
    expect(screen.queryByText("This is in a portal")).not.toBeInTheDocument();

    // Click button to open modal
    fireEvent.click(screen.getByText("Trigger"));

    // Modal content should now be visible
    expect(screen.getByText("This is in a portal")).toBeInTheDocument();

    expect(baseElement).toMatchSnapshot();
  });
});
