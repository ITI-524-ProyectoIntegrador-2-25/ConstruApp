// src/components/pages/dashboard/DashboardLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'

// IMPORTA DESDE 'components/layout', no desde 'pages/layout'
import Sidebar from '../../layout/Sidebar'
import Navbar  from '../../layout/Navbar'

export default function DashboardLayout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content">
          {/* Ahí se montarán Dashboard, Planilla, Actividades, etc. */}
          <Outlet />
        </div>
      </div>
    </div>
  )
}
