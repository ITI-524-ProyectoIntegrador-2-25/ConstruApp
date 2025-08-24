import React, { createContext, useContext, useMemo, useState } from 'react';

const PaginationContext = createContext(null);

export function usePaginationContext() {
  const ctx = useContext(PaginationContext);
  if (!ctx) throw new Error('PaginationProvider faltante');
  return ctx;
}

/**
 * Provider "headless": NO genera ningún nodo extra ni listeners globales.
 * Solo expone el estado de paginación por contexto.
 */
export function PaginationProvider({ children, initialPageSize = 10 }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, page * pageSize) - 1;

  const value = useMemo(() => ({
    pager: { page, pageSize, total, totalPages, startIndex, endIndex },
    setPage, setPageSize, setTotal, setLoading
  }), [page, pageSize, total, totalPages, startIndex, endIndex]);

  return (
    <PaginationContext.Provider value={value}>
      {children}
    </PaginationContext.Provider>
  );
}
