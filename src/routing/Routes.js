import Main from "../views/Main";
import Tiled from "../components/Tiled";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/tiled" element={<Tiled />} />
        <Route path="/maps" element={<Tiled />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
