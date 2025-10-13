import React from 'react';

/**
 * About page
 * @returns {JSX.Element}
 */
export const About: React.FC = () => {
  return (
    <section className="container" aria-labelledby="about-title">
      <h1 id="about-title">About Us</h1>
      <p>
        MiniProject II frontend implemented with Vite, React, SASS and TypeScript. This Sprint 1
        version includes navigation, about page and footer. Accessibility and usability heuristics
        will be applied across components.
      </p>
    </section>
  );
};

export default About;
