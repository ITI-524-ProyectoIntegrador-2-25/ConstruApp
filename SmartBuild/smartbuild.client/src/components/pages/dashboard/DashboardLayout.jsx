// src/components/pages/dashboard/DashboardLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../layout/Sidebar'
import Navbar  from '../../layout/Navbar'  // si lo tienes

export default function DashboardLayout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
