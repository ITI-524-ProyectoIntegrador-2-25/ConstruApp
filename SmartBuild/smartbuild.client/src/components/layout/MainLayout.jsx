// src/components/layout/MainLayout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, BarChart2, Grid, User } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import '../../styles/Layout.css';

import { PaginationProvider } from './pagination/PaginationProvider';
import GlobalPagination from './pagination/GlobalPagination';
import useGlobalPagination from './pagination/useGlobalPagination';

function PaginationSync({ routeKey }) {
  const { reset, setLoading } = useGlobalPagination();
  useEffect(() => { reset(); setLoading(false); }, [routeKey, reset, setLoading]);
  return null;
}

export default function MainLayout() {
  const location = useLocation();
  const [showProdMenu, setShowProdMenu] = useState(false);

  const pageVariants   = { initial:{opacity:0,y:10}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-10} };
  const pageTransition = { duration: 0.4, ease: 'easeInOut' };

  return (
    <PaginationProvider>
      <PaginationSync routeKey={location.pathname} />

      <div className="app">
        <Sidebar />
        <div className="main">
          <Navbar />

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ position:'relative', paddingBottom:'120px' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>

          {/* 👇 Mostrar SIEMPRE la barra (aunque total sea 0) */}
          <GlobalPagination forceVisible />

          {/* Bottom nav (mobile) */}
          <nav className="bottom-nav">
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
              <Home /><span>Dashboard</span>
            </NavLink>
            <NavLink to="/dashboard/planilla" className={({isActive}) => isActive ? 'active' : ''}>
              <BarChart2 /><span>Planilla</span>
            </NavLink>
            <div className={`prod-link${showProdMenu ? ' active' : ''}`} onClick={() => setShowProdMenu(v=>!v)}>
              <Grid /><span>Productividad</span>
              {showProdMenu && (
                <ul className="bottom-submenu">
                  <li><NavLink to="/dashboard/productividad/actividades">Actividades</NavLink></li>
                  <li><NavLink to="/dashboard/productividad/clientes">Clientes</NavLink></li>
                  <li><NavLink to="/dashboard/productividad/empleados">Empleados</NavLink></li>
                  <li><NavLink to="/dashboard/productividad/subcontratos/nuevo">Subcontratos</NavLink></li>
                </ul>
              )}
            </div>
            <NavLink to="/dashboard/usuario" className={({isActive}) => isActive ? 'active' : ''}>
              <User /><span>Usuario</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </PaginationProvider>
  );
}
