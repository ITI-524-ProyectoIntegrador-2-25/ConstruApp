// src/components/ModulePage.jsx
import React from 'react';
import './ModulePage.css';   // Reusa tu styles.css actual
import placeholderImg from '../assets/module-bg.jpg'; // Imagen genérica o específica

export default function ModulePage({ 
  bannerImage = placeholderImg,
  bannerTitle, 
  bannerText, 
  children   // Aquí irá el contenido específico del módulo (listado de temas, prácticas, etc.)
}) {
  return (
    <div className="container">
      <aside className="banner">
        <img src={bannerImage} alt={bannerTitle} className="banner__image"/>
        <h2 className="banner__title">{bannerTitle}</h2>
        <p className="banner__text">{bannerText}</p>
      </aside>

      <div className="login-panel">
        <div className="login-card">
          {children}
        </div>
      </div>
    </div>
  );
}
