// src/components/layout/pagination/GlobalPagination.jsx
import React, { useMemo } from 'react';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';
import { usePaginationContext } from './PaginationProvider';
import './GlobalPagination.css';

export default function GlobalPagination() {
  // Contexto de paginación (valores con fallback por seguridad)
  const ctx = usePaginationContext();
  const {
    page = 1,
    totalPages = 1,
    pageSize = 10,
    from = 0,
    to = 0,
    total = 0,
    labelText = 'elementos',
    isAll = false,
    setPage = () => {},
    setPageSize = () => {},
    visible, // opcional; si no existe, asumimos visible
  } = ctx || {};

  // Cálculo de progreso (0–100) robusto
  const progress = useMemo(() => {
    const tp = Math.max(1, Number(totalPages) || 1);
    const pg = Math.min(tp, Math.max(1, Number(page) || 1));
    return Math.round((pg / tp) * 100);
  }, [page, totalPages]);

  // Si el provider expone `visible` y viene en false, no renderizar
  if (visible === false) return null;

  const goFirst = () => setPage(1);
  const goPrev  = () => setPage(Math.max(1, Number(page) - 1));
  const goNext  = () => setPage(Math.min(Number(totalPages), Number(page) + 1));
  const goLast  = () => setPage(Number(totalPages));

  const disableNav = isAll || totalPages <= 1;

  return (
    <div className="global-pagination" role="region" aria-label="Controles de paginación">
      {/* Línea de progreso (DOM explícito) */}
      <div className="gp-progress" aria-hidden="true">
        <div className="gp-progress__fill" style={{ width: `${progress}%` }}>
          <div className="gp-sheen" />
        </div>
      </div>

      {/* Lado izquierdo: rango mostrado */}
      <div className="global-pagination__left" aria-live="polite">
        Mostrando <strong>{from}</strong>–<strong>{to}</strong> de <strong>{total}</strong> {labelText}
      </div>

      {/* Lado derecho: controles */}
      <div className="global-pagination__right">
        <select
          className="page-size"
          value={pageSize}
          onChange={(e) => {
            const v = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
            setPageSize(v);
            // muchas UIs reinician a la primera página al cambiar tamaño:
            setPage(1);
          }}
          aria-label="Tamaño de página"
        >
          <option value={10}>10 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
          <option value="ALL">Todas</option>
        </select>

        <div className="btn-group" role="group" aria-label="Navegación de páginas">
          <button
            className="nav-btn"
            onClick={goFirst}
            disabled={disableNav || page <= 1}
            title="Primera"
            aria-label="Ir a la primera página"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="nav-btn"
            onClick={goPrev}
            disabled={disableNav || page <= 1}
            title="Anterior"
            aria-label="Ir a la página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="page-pill" aria-live="polite">
            Página {Number(page)} / {Number(totalPages)}
          </div>

          <button
            className="nav-btn"
            onClick={goNext}
            disabled={disableNav || page >= totalPages}
            title="Siguiente"
            aria-label="Ir a la página siguiente"
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="nav-btn"
            onClick={goLast}
            disabled={disableNav || page >= totalPages}
            title="Última"
            aria-label="Ir a la última página"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
