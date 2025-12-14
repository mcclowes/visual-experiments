import Dropdown from "../DropdownContainer";
import React from "react";
import { render } from "@testing-library/react";

describe("Dropdown", () => {
  it("renders component", () => {
    const { container } = render(<Dropdown placeholder="Default Dropdown" />);
    expect(container).toMatchSnapshot();
  });

  it("renders component with options", () => {
    const { container } = render(
      <Dropdown placeholder="Default Dropdown" options={[1, 2, 3, 4, 5]} />
    );
    expect(container).toMatchSnapshot();
  });
});
