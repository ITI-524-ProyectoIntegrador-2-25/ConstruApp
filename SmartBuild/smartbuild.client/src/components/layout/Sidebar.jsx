// src/components/layout/Sidebar.jsx
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LogOut, Briefcase, BarChart2, Users, Home } from 'lucide-react'
// Asegúrate de que Logo.svg está en src/assets/img/Logo.svg
import Logo from '../../assets/img/Logo.svg'

export default function Sidebar() {
  const [openProd, setOpenProd] = useState(false)

  return (
    <aside className="sidebar">
      {/* Solo el logo, sin texto */}
      <div className="sidebar__logo">
        <img src={Logo} alt="" />
      </div>

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
            {openProd && (
              <ul className="submenu">
                <li>
                  <NavLink to="/dashboard/productividad/actividades" className="navlink sublink">
                    Actividades
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/productividad/clientes" className="navlink sublink">
                    Clientes
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/productividad/empleados" className="navlink sublink">
                    Empleados
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

      <div className="sidebar__logout">
        <NavLink to="/logout" className="navlink">
          <LogOut size={20}/> <span>Cerrar sesión</span>
        </NavLink>
      </div>
    </aside>
  )
}
