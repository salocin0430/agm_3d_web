import React from 'react';
import { Link } from 'react-router-dom';
import './../../styles/ProjectDetail.css';

const ProjectDetail = ({ project }) => {
  return (
    <div className="project-detail">
      {/* Banner destacado para la experiencia 3D */}
      <div className="project-3d-banner">
        <div className="banner-content">
          <h2 className="banner-title">Experiencia inmersiva en 3D</h2>
          <p className="banner-description">
            Explora este proyecto en un entorno 3D interactivo. Navega por el espacio, examina los detalles y descubre cada elemento del diseño.
          </p>
        </div>
        <Link to={`/projects/${project.id}/3d-viewer`} className="banner-3d-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M18.25 7.6l-5.5-3.18c-.46-.27-1.04-.27-1.5 0L5.75 7.6c-.46.27-.75.76-.75 1.3v6.35c0 .54.29 1.03.75 1.3l5.5 3.18c.46.27 1.04.27 1.5 0l5.5-3.18c.46-.27.75-.76.75-1.3V8.9c0-.54-.29-1.03-.75-1.3z"/>
          </svg>
          Explorar en 3D
        </Link>
      </div>
      
      {/* Resto del contenido */}
      <h1 className="project-title">{project.title}</h1>
      <div className="project-content">
        {/* Descripción, imágenes, etc. */}
      </div>
    </div>
  );
};

export default ProjectDetail; 