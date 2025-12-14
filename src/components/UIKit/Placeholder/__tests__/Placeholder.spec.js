import Placeholder from "../Placeholder";
import React from "react";
import { render } from "@testing-library/react";

describe("Placeholder", () => {
  it("renders default component", () => {
    const { container } = render(<Placeholder />);
    expect(container).toMatchSnapshot();
  });
});
