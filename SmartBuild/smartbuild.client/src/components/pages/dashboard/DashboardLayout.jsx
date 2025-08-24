import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../layout/Sidebar';
import Navbar  from '../../layout/Navbar';

// usa SIEMPRE el barrel de la carpeta pagination
import { PaginationProvider, GlobalPagination } from '../../layout/pagination';

export default function DashboardLayout() {
  return (
    <PaginationProvider>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div className="content">
            <Outlet />
          </div>
        </div>

        {/* Barra de paginación global fija al fondo */}
        <GlobalPagination />
      </div>
    </PaginationProvider>
  );
}
