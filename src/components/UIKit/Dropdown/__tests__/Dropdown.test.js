import Dropdown from "../DropdownContainer";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

describe("Dropdown", () => {
  it("interaction", () => {
    const { container } = render(<Dropdown placeholder="Default Dropdown" />);

    // Initially closed
    expect(container.firstChild).toBeInTheDocument();

    // Click to open
    fireEvent.click(container.firstChild);

    // Verify dropdown is rendered
    expect(container).toMatchSnapshot();
  });
});
