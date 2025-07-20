// src/components/layout/MainLayout.jsx
import React, { useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, BarChart2, Grid, User } from 'lucide-react'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'
import '../../styles/Layout.css'

export default function MainLayout() {
  const location = useLocation()
  const [showProdMenu, setShowProdMenu] = useState(false)
  const toggleProdMenu = () => setShowProdMenu(v => !v)

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -10 }
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
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            style={{ position: 'relative' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {/* Bottom navigation for mobile */}
        <nav className="bottom-nav">
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
            <Home />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/dashboard/planilla" className={({isActive}) => isActive ? 'active' : ''}>
            <BarChart2 />
            <span>Planilla</span>
          </NavLink>
          <div className={`prod-link${showProdMenu ? ' active' : ''}`} onClick={toggleProdMenu}>
            <Grid />
            <span>Productividad</span>
            {showProdMenu && (
              <ul className="bottom-submenu">
                <li><NavLink to="/dashboard/productividad/actividades">Actividades</NavLink></li>
                <li><NavLink to="/dashboard/productividad/clientes">Clientes</NavLink></li>
                <li><NavLink to="/dashboard/productividad/empleados">Empleados</NavLink></li>
              </ul>
            )}
          </div>
          <NavLink to="/dashboard/usuario" className={({isActive}) => isActive ? 'active' : ''}>
            <User />
            <span>Usuario</span>
          </NavLink>
        </nav>
      </div>
    </div>
  )
}
