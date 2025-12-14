import Main from "../Main";
import React from "react";
import { render } from "@testing-library/react";

it("renders component", () => {
  const { container } = render(<Main />);
  expect(container.firstChild).toBeInTheDocument();
});
