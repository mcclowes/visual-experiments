import React from "react";
import { render } from "@testing-library/react";
import Loader from "../Loader";

describe("Loader", () => {
  it("renders the component as expected", () => {
    const { container } = render(<Loader placeholders={2} />);
    expect(container).toMatchSnapshot();
  });
});
