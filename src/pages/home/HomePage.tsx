import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
/**
 * Home page component
 * @returns {JSX.Element}
 */
export const HomePage: React.FC = () => {
  return (
    <main
      className="home-container"
      role="main"
      aria-labelledby="page-title"
      aria-live="polite"
      aria-label="Página de inicio"
    >
      <h1 id="page-title" className="visually-hidden">
        Inicio - Lumière
      </h1>

      {/* HERO SECTION with VIDEO */}
      <section className="hero" aria-label="Sección de bienvenida">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-video"
          aria-hidden="true"
        >
          <source src="wallpapervideo.mp4" type="video/mp4" />
          Tu navegador no soporta la reproducción de video.
        </video>
        <div className="hero-overlay" aria-hidden="true"></div>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Encuentra tus películas favoritas <br />y comparte tu opinión con
              los demás
            </h1>
            <Link to="/login">
              <button className="btn-primary">Empieza ya!</button>
            </Link>
          </div>
        </div>
      </section>

      {/* SCROLLABLE MOVIE CAROUSEL */}
      <section
        className="movie-carousel"
        role="region"
        aria-labelledby="carousel-heading"
      >
        <h2 id="carousel-heading">Explora lo más popular</h2>
        <div className="movie-scroll">
          <img src="fightclub.jpg" alt="Fight Club" />
          <img src="blackswan.jpg" alt="Black Swan" />
          <img src="avengers.jpg" alt="Avengers" />
          <img src="amoresperros.jpg" alt="Amores Perros" />
          <img src="inception.jpg" alt="Inception" />
          <img src="parasite.jpg" alt="Parasite" />
          <img src="interstellar.jpg" alt="Interstellar" />
          <img src="bokunohero.jpg" alt="Boku no Hero" />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        className="features"
        role="region"
        aria-label="Características principales"
      >
        <h2>¿Por qué elegir Lumière?</h2>
        <div className="feature-list">
          <div className="feature">
            <i className="fa-regular fa-eye"></i>
            <h3>Descubre nuevas historias</h3>
            <p>
              Explora películas de todo el mundo y encuentra joyas ocultas que
              te sorprenderán.
            </p>
          </div>

          <div className="feature">
            <i className="fa-regular fa-heart"></i>
            <h3>Guarda tus favoritas</h3>
            <p>
              Crea tu colección personal y vuelve a ver esas películas que te
              marcaron.
            </p>
          </div>

          <div className="feature">
            <i className="fa-regular fa-star"></i>
            <h3>Comparte tus opiniones</h3>
            <p>
              Escribe reseñas, califica y conversa con otros amantes del cine.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
