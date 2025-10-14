import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { Login } from "./pages/login/Login";
import { Register } from "./pages/register/Register";
import { Nav } from "./components/Nav";
import { About } from "./pages/about/About";


/**
 * Root application component with routing
 * @returns {JSX.Element}
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
        </Routes>
      </main>
      
    </BrowserRouter>
  );
};

export default App;
