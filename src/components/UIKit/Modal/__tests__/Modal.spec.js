import Modal from "../Modal";
import React from "react";
import { render } from "@testing-library/react";
import ReactModal from "react-modal";

// Set app element for react-modal in tests
ReactModal.setAppElement(document.createElement("div"));

const ContentMock = () => {
  return <div>This is in a portal</div>;
};

describe("Modal", () => {
  it("renders open", () => {
    const { baseElement } = render(
      <Modal open={true} doClose={() => {}} closeIcon={true}>
        <ContentMock />
      </Modal>
    );
    expect(baseElement).toMatchSnapshot();
  });

  it("renders closed", () => {
    const { baseElement } = render(
      <Modal open={false} doClose={() => {}} closeIcon={true}>
        <ContentMock />
      </Modal>
    );
    expect(baseElement).toMatchSnapshot();
  });

  it("no icon", () => {
    const { baseElement } = render(
      <Modal open={true} doClose={() => {}} closeIcon={false}>
        <ContentMock />
      </Modal>
    );
    expect(baseElement).toMatchSnapshot();
  });
});
