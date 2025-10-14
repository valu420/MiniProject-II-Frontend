import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { About } from './pages/About';
import ChangePassword from './pages/change-password/ChangePassword';
import EditInfo from './pages/edit-info/EditInfo';
import { HomePage } from './pages/home/HomePage';
import { Login } from './pages/login/Login';
import { Register } from './pages/register/Register';

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
          <Route path="/edit-info" element={<EditInfo />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
