import React from 'react';
import "./About.css";

/**
 * About page
 * @returns {JSX.Element}
 */
export const About: React.FC = () => {
  return (
    <div className="about-container">
 
      {/* Introducción */}
      <section className="about-hero">
        <h1>Sobre Nosotros</h1>
        <p>
          En <strong>Lumière</strong> creemos que el cine es más que entretenimiento: es una forma
          de conectar culturas, emociones e ideas. Nuestra plataforma nació con el propósito de
          acercar a las personas a sus películas favoritas y crear una comunidad que valore el arte
          cinematográfico.
        </p>
      </section>

      {/* Objetivo */}
      <section className="about-mission">
        <h2>Nuestro objetivo</h2>
        <p>
          Buscamos fomentar la pasión por el cine mediante la exploración, el análisis y la
          conversación. Queremos que cada usuario pueda descubrir nuevas historias, compartir su
          opinión y sentirse parte de una comunidad cinéfila vibrante.
        </p>
      </section>

      {/* Equipo */}
      <section className="about-team">
        <h2>Nuestro equipo</h2>
        <div className="team-cards">
          <div className="team-card">
            <h3>John Ramos</h3>
            <p>Desarrollador frontend</p>
          </div>
          <div className="team-card">
            <h3>Gabriela Guzman</h3>
            <p>Desarrolladora backend</p>
          </div>
          <div className="team-card">
            <h3>Juan Pablo Moreno</h3>
            <p>Desarrollador frontend</p>
          </div>
           <div className="team-card">
            <h3>Kevin Ramirez</h3>
            <p>Desarrollador backend</p>
          </div>
           <div className="team-card">
            <h3>Valentina Sanchez</h3>
            <p>Product Owner/ Tester</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
