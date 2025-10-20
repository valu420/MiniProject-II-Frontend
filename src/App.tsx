import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from './components/Nav';
import Footer from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { About } from './pages/about/About';
import ChangePassword from './pages/change-password/ChangePassword';
import Profile from './pages/profile/Profile';
import { HomePage } from './pages/home/HomePage';
import { Login } from './pages/login/Login';
import { Menu } from './pages/menu/Menu';
import { Register } from './pages/register/Register';
import { ResetPassword } from './pages/reset-password/ResetPassword';
import  SiteMap  from './pages/sitemap/SiteMap';

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
  const hideNavbarRoutes = ['/menu', '/profile'];
  const hideFooterRoutes = ['/menu', '/login', '/register', '/change-password', '/reset-password'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

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
          <Route path="/sitemap" element={<SiteMap />} />
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
    {!shouldHideFooter && <Footer />}
    </>
  );
};

export default App;
