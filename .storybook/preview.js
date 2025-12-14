import React from "react";
import { ThemeProvider } from "styled-components";
import ReactModal from "react-modal";
import theme from "../src/theme";
import GlobalStyle from "../src/GlobalStyle";

// Set app element for react-modal in Storybook
ReactModal.setAppElement("#storybook-root");

const withTheme = (Story) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <Story />
  </ThemeProvider>
);

export const decorators = [withTheme];
