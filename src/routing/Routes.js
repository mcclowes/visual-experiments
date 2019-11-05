import Main from "../views/Main";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

const Routes = () => {
  return (
    <Router>
      <Route exact path="/" component={Main} />
    </Router>
  );
};

export default Routes;
