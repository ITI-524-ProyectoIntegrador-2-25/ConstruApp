import React, { useState, useEffect, useRef } from 'react'
import slide1 from '../../assets/img/dashboard.png'
import slide2 from '../../assets/img/img2.webp'
import slide3 from '../../assets/img/img3.jpg'
import '../styles/Banner.css'

const slides = [
  { image: slide1, title: 'Gestiona tu presupuesto', text: 'Planifica, controla y analiza tus recursos...' },
  { image: slide2, title: 'Controla tus recursos',   text: 'Monitorea gastos, actividades y decisiones...' },
  { image: slide3, title: 'Genera reportes',         text: 'Visualiza datos, actividades y resultados...' }
]

export default function Banner() {
  const [current, setCurrent] = useState(0)
  const dragStartX = useRef(null)

  // autoplay
  useEffect(() => {
    const iv = setInterval(() => {
      setCurrent(i => (i + 1) % slides.length)
    }, 5000)
    return () => clearInterval(iv)
  }, [])

  const onStart = e => {
    dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX
  }
  const onEnd = e => {
    if (dragStartX.current == null) return
    const endX = e.changedTouches
      ? e.changedTouches[0].clientX
      : e.clientX
    const delta = endX - dragStartX.current
    if (delta > 50)       setCurrent(i => (i - 1 + slides.length) % slides.length)
    else if (delta < -50) setCurrent(i => (i + 1) % slides.length)
    dragStartX.current = null
  }

  return (
    <aside className="banner">
      <div
        className="banner__image-container"
        onMouseDown={onStart}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={onStart}
        onTouchEnd={onEnd}
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
  )
}
