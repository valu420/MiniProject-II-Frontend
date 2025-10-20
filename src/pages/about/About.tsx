import React from 'react';
import "./About.css";

/**
 * About page
 * @returns {JSX.Element}
 */
export const About: React.FC = () => {
  return (
    <main className="about-container" role="main" aria-labelledby="about-title">
      <h1 id="about-title" className="visually-hidden">Sobre Nosotros - Lumière</h1>
 
      {/* Introducción */}
      <section className="about-hero" aria-labelledby="hero-heading">
        <h1 id="hero-heading">Sobre Nosotros</h1>
        <p>
          En <strong>Lumière</strong> creemos que el cine es más que entretenimiento: es una forma
          de conectar culturas, emociones e ideas. Nuestra plataforma nació con el propósito de
          acercar a las personas a sus películas favoritas y crear una comunidad que valore el arte
          cinematográfico.
        </p>
      </section>

      {/* Objetivo */}
      <section className="about-mission" role="region" aria-labelledby="mission-heading">
        <h2 id="mission-heading">Nuestro objetivo</h2>
        <p>
          Buscamos fomentar la pasión por el cine mediante la exploración, el análisis y la
          conversación. Queremos que cada usuario pueda descubrir nuevas historias, compartir su
          opinión y sentirse parte de una comunidad cinéfila vibrante.
        </p>
      </section>

      {/* Equipo */}
      <section className="about-team" role="region" aria-labelledby="team-heading">
        <h2 id="team-heading">Nuestro equipo</h2>
        <div className="team-cards" role="list">
          <article className="team-card" role="listitem">
            <h3>John Ramos</h3>
            <p>Desarrollador frontend</p>
          </article>
          <article className="team-card" role="listitem">
            <h3>Gabriela Guzman</h3>
            <p>Desarrolladora backend</p>
          </article>
          <article className="team-card" role="listitem">
            <h3>Juan Pablo Moreno</h3>
            <p>Desarrollador frontend</p>
          </article>
          <article className="team-card" role="listitem">
            <h3>Kevin Ramirez</h3>
            <p>Desarrollador backend</p>
          </article>
          <article className="team-card" role="listitem">
            <h3>Valentina Sanchez</h3>
            <p>Product Owner/ Tester</p>
          </article>
        </div>
      </section>

    </main>
  );
};

export default About;
