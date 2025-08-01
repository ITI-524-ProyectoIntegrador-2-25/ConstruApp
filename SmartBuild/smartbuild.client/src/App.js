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
import DetalleDashboard from './components/pages/dashboard/DetalleDashboard'
import FormDashboard from './components/pages/dashboard/FormDashboard'
import Planilla    from './components/pages/planilla/Planilla'
import FormPlanilla    from './components/pages/planilla/FormPlanilla'
import DetallePlanilla from './components/pages/planilla/DetallePlanilla'
import Actividades from './components/pages/productividad/Actividades'
import FormActividades from './components/pages/productividad/FormActividades'
import DetalleActividades from './components/pages/productividad/DetalleActividades'
import Clientes    from './components/pages/productividad/Clientes'
import DetalleCliente from './components/pages/productividad/DetalleCliente'
import FormCliente from './components/pages/productividad/FormCliente'
import Empleados   from './components/pages/productividad/Empleados'
import FormEmpleado   from './components/pages/productividad/FormEmpleado'
import DetalleEmpleado from './components/pages/productividad/DetalleEmpleado'
import Subcontrato   from './components/pages/productividad/Subcontratos'
import FormSubcontrato   from './components/pages/productividad/FormSubcontrato'
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
          <Route path="/dashboard/*" element={<DashboardLayout/>}>
          <Route path="proyectos/nuevo"                 element={<FormDashboard />} />
          <Route path="proyectos/:idPresupuesto" element={<DetalleDashboard />} />
          <Route index                                  element={<Dashboard   />} />
          <Route path="planilla"                        element={<Planilla    />} />
          <Route path="planilla/nueva"                  element={<FormPlanilla />} />
          <Route path="planilla/:idPlanilla"                    element={<DetallePlanilla />} />
          <Route path="productividad/actividades"       element={<Actividades />} />
          <Route path="productividad/actividades/nueva" element={<FormActividades />} />
          <Route path="productividad/actividades/:idActividad"   element={<DetalleActividades />} />
          <Route path="productividad/clientes"               element={<Clientes    />} />
          <Route path="productividad/clientes/nuevo"         element={<FormCliente />} />
          <Route path="productividad/clientes/:idCliente"    element={<DetalleCliente />} />
          <Route path="productividad/empleados"         element={<Empleados   />} />
          <Route path="productividad/empleados/:idEmpleado"            element={<DetalleEmpleado />} />
          <Route path="productividad/empleados/nuevo" element={<FormEmpleado />} />
          <Route path="productividad/subcontratos"         element={<Subcontrato/>} />
          <Route path="productividad/subcontratos/nuevo"         element={<FormSubcontrato/>} />
          <Route path="usuario"                         element={<UserProfile />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
