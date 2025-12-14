import React from "react";
import Icon from "../Icon";
import Icons from "../Icons";
import { render } from "@testing-library/react";

const defaultProps = {
  path: Icons.TICK,
};

describe("Icon", () => {
  it("renders as expected", () => {
    const { container } = render(<Icon {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });
});
