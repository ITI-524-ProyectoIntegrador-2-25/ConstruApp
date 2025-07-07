// src/components/Banner.jsx
import React, { useState, useEffect, useRef } from 'react';
import slide1 from '../assets/dashboard.png';
import slide2 from '../assets/img2.webp';
import slide3 from '../assets/img3.jpg';
import './Banner.css';

const slides = [
  { image: slide1, title: 'Gestiona tu presupuesto', text: 'Planifica, controla y analiza tus recursos...' },
  { image: slide2, title: 'Controla tus recursos', text: 'Monitorea gastos, actividades y decisiones...' },
  { image: slide3, title: 'Genera reportes con facilidad', text: 'Visualiza datos, actividades y resultados...' }
];

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);
  const dragStartX = useRef(null);

  // Auto-play cada 5s
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrent(i => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // Manejadores de drag
  const handleDragStart = (e) => {
    dragStartX.current = e.type.includes('mouse')
      ? e.clientX
      : e.touches[0].clientX;
  };

  const handleDragEnd = (e) => {
    if (dragStartX.current == null) return;
    const endX = e.type.includes('mouse')
      ? e.clientX
      : e.changedTouches[0].clientX;
    const delta = endX - dragStartX.current;
    const threshold = 50; // px mínimos para swipe
    if (delta > threshold) {
      // swipe hacia la derecha → anterior
      setCurrent(i => (i - 1 + slides.length) % slides.length);
    } else if (delta < -threshold) {
      // swipe hacia la izquierda → siguiente
      setCurrent(i => (i + 1) % slides.length);
    }
    dragStartX.current = null;
  };

  return (
    <aside className="banner">
      <div
        ref={containerRef}
        className="banner__image-container"
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        <img
          src={slides[current].image}
          alt={slides[current].title}
          className="banner__image"
          draggable={false}
        />
      </div>

      <h2 className="banner__title">{slides[current].title}</h2>
      <p className="banner__text">{slides[current].text}</p>

      <div className="banner__dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </aside>
  );
}
