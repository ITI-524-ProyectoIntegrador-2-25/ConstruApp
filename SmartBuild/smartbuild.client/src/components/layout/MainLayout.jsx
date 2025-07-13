// src/components/layout/MainLayout.jsx
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'
import '../../styles/Layout.css'

export default function MainLayout() {
  const location = useLocation()

  const pageVariants = {
    initial:   { opacity: 0, y: 10 },
    animate:   { opacity: 1, y: 0 },
    exit:      { opacity: 0, y: -10 }
  }

  const pageTransition = {
    duration: 0.4,
    ease:     'easeInOut'
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar />

        <AnimatePresence mode="wait">
          {/* key={location.pathname} fuerza un remount al cambiar de ruta */}
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            style={{ position: 'relative' }}  // evita flashes de fondo
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
