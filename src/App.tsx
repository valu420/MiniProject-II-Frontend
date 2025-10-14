import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from './components/Nav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { About } from './pages/about/About';
import ChangePassword from './pages/change-password/ChangePassword';
import Profile from './pages/profile/Profile';
import { HomePage } from './pages/home/HomePage';
import { Login } from './pages/login/Login';
import { Menu } from './pages/menu/Menu';
import { Register } from './pages/register/Register';
import { ResetPassword } from './pages/reset-password/ResetPassword';

/**
 * Root application component with routing
 * @returns {JSX.Element}
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

/**
 * Componente interno que maneja el contenido de la app
 * Utiliza useLocation para controlar la visibilidad del navbar
 */
const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Rutas donde no queremos mostrar el navbar
  const hideNavbarRoutes = ['/menu'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Nav />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Rutas protegidas que requieren autenticación */}
          <Route 
            path="/menu" 
            element={
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </>
  );
};

export default App;
