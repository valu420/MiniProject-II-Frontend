import React from 'react';
import "./HomePage.css";
import { Link } from 'react-router-dom';
/**
 * Home page component
 * @returns {JSX.Element}
 */
export const HomePage: React.FC = () => {
  return (
    <div className="home-container">
     
      {/* Hero Section */}
      <section className="hero">
        <h1>
          Encuentra tus películas favoritas <br /> y comparte tu opinión con los demás
        </h1>
        <Link to="/login"><button className="btn-primary"> Empieza ya!</button></Link>
      </section>

      {/* Movie Previews */}
      <section className="movie-list">
        <img src="fightclub.jpg" alt="Fight Club" />
        <img src="blackswan.jpg" alt="Black Swan" />
        <img src="avengers.jpg" alt="Avengers" />
        <img src="amoresperros.jpg" alt="Amores Perros" />
      </section>

 {/* Features */}
      <section className="features">
        <div className="feature">
          <i className="fa-regular fa-eye"></i>
          <h3>Descubre nuevas historias</h3>
          <p>
            Explora películas de todo el mundo y encuentra joyas ocultas que te sorprenderán.
          </p>
        </div>
        <div className="feature">
          <i className="fa-regular fa-heart"></i>
          <h3>Guarda tus favoritas</h3>
          <p>
            Crea tu colección personal y vuelve a ver esas películas que te marcaron.
          </p>
        </div>
        <div className="feature">
          <i className="fa-regular fa-star"></i>
          <h3>Comparte tus opiniones</h3>
          <p>
            Escribe reseñas, califica y conversa con otros amantes del cine.
          </p>
        </div>
      </section>


    </div>
  );
};

export default HomePage;


