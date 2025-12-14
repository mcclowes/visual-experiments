import Button from "../Button";
import React from "react";
import { render } from "@testing-library/react";

describe("Button", () => {
  it("renders component", () => {
    const { container } = render(<Button text="Default Button" />);
    expect(container).toMatchSnapshot();
  });

  it("renders component with text", () => {
    const { getByText } = render(<Button text="Click me" />);
    expect(getByText("Click me")).toBeInTheDocument();
  });
});
