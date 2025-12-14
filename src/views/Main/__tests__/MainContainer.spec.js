import MainContainer from "../MainContainer";
import React from "react";
import { render } from "@testing-library/react";

it("renders component", () => {
  const { container } = render(<MainContainer />);
  expect(container).toMatchSnapshot();
});
