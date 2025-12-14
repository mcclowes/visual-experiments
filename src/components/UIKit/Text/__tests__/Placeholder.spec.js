import Text from "../Text";
import React from "react";
import { render } from "@testing-library/react";

describe("Text", () => {
  it("renders Paragraph component", () => {
    const { container } = render(<Text.Paragraph>Some text goes here</Text.Paragraph>);
    expect(container).toMatchSnapshot();
  });
});
