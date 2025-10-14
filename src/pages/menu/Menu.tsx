import React, { useState } from 'react';
import './Menu.css';

export const Menu: React.FC = () => {
    return (
        <div className="menu-container">
            <h1 className="menu-title">Menu</h1>
            <ul className="menu-list">
                <li className="menu-item">Home</li>
                <li className="menu-item">About</li>
                <li className="menu-item">Login</li>
                <li className="menu-item">Register</li>
            </ul>
        </div>
    );
};
