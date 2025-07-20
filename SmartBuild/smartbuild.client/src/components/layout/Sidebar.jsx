// src/components/layout/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, BarChart2, Briefcase, User, ChevronDown, ChevronUp, LogOut } from 'lucide-react'
import Logo from '../../assets/img/Logo.svg'

export default function Sidebar() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [prodOpen, setProdOpen] = useState(false)

  const prodRef = useRef(null)

  useEffect(() => {
    const onClickOutside = e => {
      if (prodRef.current && !prodRef.current.contains(e.target)) {
        setProdOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const toggleSidebar = () => setCollapsed(v => !v)
  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/')
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* HEADER: logo + toggle */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <img src={Logo} alt="Smart Build" />
        </div>
        <button
          className="sidebar__toggle-btn"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}        
        </button>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="sidebar__nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className="navlink">
              <Home size={20}/>
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/planilla" className="navlink">
              <BarChart2 size={20}/>
              {!collapsed && <span>Planilla</span>}
            </NavLink>
          </li>
          <li>
            <button
              className="navlink navlink--button"
              onClick={() => setProdOpen(o => !o)}
            >
              <Briefcase size={20}/>
              {!collapsed && <span>Productividad</span>}
              {!collapsed && (
                 <ChevronDown
                    className={`arrow${prodOpen ? ' open' : ''}`}
                    size={20}
                  />
              )}
            </button>

            {/* Submenú con iconos */}
            {!collapsed && prodOpen && (
              <ul className="submenu">
                <li>
                  <NavLink to="/dashboard/productividad/actividades" className="sublink">
                    <BarChart2 size={18}/> <span>Actividades</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/productividad/clientes" className="sublink">
                    <User size={18}/> <span>Clientes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/productividad/empleados" className="sublink">
                    <User size={18}/> <span>Empleados</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <NavLink to="/dashboard/usuario" className="navlink">
              <User size={20}/>
              {!collapsed && <span>Usuario</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* LOGOUT */}
      <div className="sidebar__logout">
        <button className="navlink navlink--button" onClick={handleLogout}>
          <LogOut size={20}/>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
