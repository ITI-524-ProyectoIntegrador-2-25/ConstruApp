// src/components/layout/MainLayout.jsx
import React from 'react'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'
import { Outlet } from 'react-router-dom'
// Si tienes estilos específicos para el layout:
import '../../styles/Layout.css'

export default function MainLayout() {
  return (
    <div className="app-container">
      {/* Barra lateral */}
      <Sidebar />

      {/* Zona principal */}
      <div className="main-content">
        {/* Barra superior con avatar */}
        <Navbar />

        {/* Aquí dentro carga Dashboard, Planilla, etc */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
