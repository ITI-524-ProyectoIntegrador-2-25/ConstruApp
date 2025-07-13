// src/components/layout/MainLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

export default function MainLayout() {
  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Navbar />
        <div className="content">
          {/* Aquí montará Dashboard, Planilla, Actividades, etc. */}
          <Outlet />
        </div>
      </div>
    </div>
  )
}
