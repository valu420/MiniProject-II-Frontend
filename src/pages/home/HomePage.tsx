import React from 'react';

/**
 * Home page component
 * @returns {JSX.Element}
 */
export const HomePage: React.FC = () => {
  return (
    <section className="container" aria-labelledby="home-title">
      <h1 id="home-title">Welcome to MiniProject II</h1>
      <p>
        This is the Sprint 1 client version. Navigation, about page and footer with sitemap are
        available. Authentication and movie endpoints will be wired to the backend via Fetch API.
      </p>
    </section>
  );
};

export default HomePage;


