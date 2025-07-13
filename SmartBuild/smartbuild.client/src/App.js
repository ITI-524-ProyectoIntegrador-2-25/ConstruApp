// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// layouts
import AccessLayout    from './components/layout/AccessLayout'
import DashboardLayout from './components/pages/dashboard/DashboardLayout'

// access pages
import LoginForm      from './components/pages/access/scripts/LoginForm'
import Register       from './components/pages/access/scripts/Register'
import ForgotPassword from './components/pages/access/scripts/ForgotPassword'

// protected pages
import Dashboard   from './components/pages/dashboard/Dashboard'
import Planilla    from './components/pages/planilla/Planilla'
import Actividades from './components/pages/productividad/Actividades'
import Clientes    from './components/pages/productividad/Clientes'
import Empleados   from './components/pages/productividad/Empleados'
import UserProfile from './components/pages/usuario/UserProfile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/** Rutas de acceso público bajo “/” **/}
        <Route path="/" element={<AccessLayout />}>
          <Route index                   element={<LoginForm      />} />
          <Route path="register"         element={<Register       />} />
          <Route path="forgot-password"  element={<ForgotPassword />} />
        </Route>

        {/** Rutas protegidas bajo “/dashboard” **/}
        <Route path="/dashboard/*" element={<DashboardLayout />}>
          <Route index                                  element={<Dashboard   />} />
          <Route path="planilla"                        element={<Planilla    />} />
          <Route path="productividad/actividades"       element={<Actividades />} />
          <Route path="productividad/clientes"          element={<Clientes    />} />
          <Route path="productividad/empleados"         element={<Empleados   />} />
          <Route path="usuario"                         element={<UserProfile />} />
        </Route>

        {/** Cualquier otra ruta → redirigir al login **/}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
