import App from "../App";
import React from "react";
import { render, screen } from "@testing-library/react";

it("renders without crashing", () => {
  render(<App />);
});
