import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// layouts
import AccessLayout from './components/layout/AccessLayout'
import MainLayout   from './components/layout/MainLayout'

// access pages
import LoginForm      from './components/pages/access/scripts/LoginForm'
import Register       from './components/pages/access/scripts/Register'
import ForgotPassword from './components/pages/access/scripts/ForgotPassword'

// protected pages
import Dashboard   from './components/pages/dashboard/Dashboard'
import Planilla    from './components/pages/planilla/Planilla'
import Actividades from './components/pages/productividad/Actividades.jsx'
import Clientes    from './components/pages/productividad/Clientes.jsx/index.js'
import Empleados   from './components/pages/productividad/Empleados.jsx/index.js'
import UserProfile from './components/pages/usuario/UserProfile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS DE ACCESO: usan AccessLayout */}
<Route element={<AccessLayout />}>
  <Route index                element={<LoginForm />} />
  <Route path="register"      element={<Register />} />
  <Route path="forgot-password" element={<ForgotPassword />} />
</Route>

        {/* RUTAS PROTEGIDAS: usan MainLayout */}
        <Route path="dashboard/*" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="planilla"                      element={<Planilla />} />
          <Route path="productividad/actividades"     element={<Actividades />} />
          <Route path="productividad/clientes"        element={<Clientes />} />
          <Route path="productividad/empleados"       element={<Empleados />} />
          <Route path="usuario"                       element={<UserProfile />} />
        </Route>

        {/* Cualquier otra → login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
