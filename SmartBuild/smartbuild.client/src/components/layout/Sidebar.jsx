// src/components/layout/Sidebar.jsx
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LogOut,
  Briefcase,
  BarChart2,
  Users,
  Home,
  ClipboardList,
  UserPlus,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Logo from '../../assets/img/Logo.svg'

export default function Sidebar() {
  const [openProd, setOpenProd]   = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* HEADER: logo + toggle */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <img src={Logo} alt="" />
        </div>
        <button
          className="sidebar__toggle-btn"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/> }
        </button>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="sidebar__nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className="navlink">
              <Home size={20}/> <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/planilla" className="navlink">
              <BarChart2 size={20}/> <span>Planilla</span>
            </NavLink>
          </li>
          <li>
            <button
              className="navlink navlink--button"
              onClick={() => setOpenProd(o => !o)}
            >
              <Briefcase size={20}/> <span>Productividad</span>
              <span className={`arrow ${openProd ? 'open' : ''}`} />
            </button>

            {/* Submenú con iconos */}
            {openProd && (
              <ul className="submenu">
                <li>
                  <NavLink
                    to="/dashboard/productividad/actividades"
                    className="navlink sublink"
                  >
                    <ClipboardList size={18}/> <span>Actividades</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/productividad/clientes"
                    className="navlink sublink"
                  >
                    <UserPlus size={18}/> <span>Clientes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/productividad/empleados"
                    className="navlink sublink"
                  >
                    <UserCheck size={18}/> <span>Empleados</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <NavLink to="/dashboard/usuario" className="navlink">
              <Users size={20}/> <span>Usuario</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* LOGOUT */}
      <div className="sidebar__logout">
        <NavLink to="/logout" className="navlink">
          <LogOut size={20}/> <span>Cerrar sesión</span>
        </NavLink>
      </div>
    </aside>
  )
}
