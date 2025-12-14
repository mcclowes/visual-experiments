import Padded from "../Padded";
import React from "react";
import { render } from "@testing-library/react";

describe("Padded", () => {
  it("renders default component", () => {
    const { container } = render(<Padded />);
    expect(container).toMatchSnapshot();
  });
});
