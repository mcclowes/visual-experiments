import React from "react";
import Placeholder from "./Placeholder";

export default { title: "uikit-Placeholder" };

export const simple = () => {
  return <Placeholder />;
};

export const textBlock = () => {
  return <Placeholder lines={5} />;
};
