import React from 'react';
import { Link } from 'react-router-dom';
import "./Footer.css";

/**
 * Site footer with sitemap
 * @returns {JSX.Element}
 */
export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Enlaces */}
        <div className="footer-links">
          <div className="footer-column">
            <h4>Explore</h4>
            <ul>
              <li>
                <Link to="/sitemap">Mapa del sitio</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="mailto:contact@lumiere.com">contact@lumiere.com</a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      
    </footer>
  );
};

export default Footer;
