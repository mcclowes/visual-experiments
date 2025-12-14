import GlobalStyle from "./GlobalStyle";
import Helmet from "react-helmet";
import React from "react";
import AppRoutes from "./routing/Routes";
import theme from "./theme";
import { ThemeProvider } from "styled-components";

function App() {
  return (
    <div className="App">
      <GlobalStyle />

      <Helmet>
        <meta charSet="utf-8" />

        <title>Many Moths</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <AppRoutes />
      </ThemeProvider>
    </div>
  );
}

export default App;
// todo: routing
// todo: route switch component
