import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Main navigation component
 * @returns {JSX.Element}
 */
export const Nav: React.FC = () => {
  return (
    
      <nav >
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
    
  );
};


