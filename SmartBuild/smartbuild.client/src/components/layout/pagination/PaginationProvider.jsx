// src/components/layout/pagination/PaginationProvider.jsx
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const PaginationContext = createContext(null);

export default function PaginationProvider({ children }) {
  // estado base
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);         // 12 | 48 | 96 | 'ALL'
  const [total, setTotal] = useState(0);
  const [labelText, setLabel] = useState('elementos');

  // registro de consumidores (para saber si hay alguien usando la paginación)
  const consumers = useRef(0);
  const [visible, setVisible] = useState(false);

  const register = useCallback(() => {
    consumers.current += 1;
    setVisible(consumers.current > 0);
    return () => {
      consumers.current = Math.max(0, consumers.current - 1);
      setVisible(consumers.current > 0);
    };
  }, []);

  const isAll = pageSize === 'ALL';
  const size = useMemo(() => (isAll ? Math.max(1, total) : Number(pageSize) || 10), [isAll, pageSize, total]);

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    if (isAll) return 1;
    return Math.max(1, Math.ceil(total / size));
  }, [total, isAll, size]);

  const safePage = useMemo(() => Math.min(Math.max(1, page), totalPages), [page, totalPages]);

  const from = useMemo(() => (total === 0 ? 0 : (isAll ? 1 : (safePage - 1) * size + 1)), [total, isAll, safePage, size]);
  const to   = useMemo(() => (isAll ? total : Math.min(total, safePage * size)), [total, isAll, safePage, size]);

  const slice = useCallback((arr) => {
    const a = Array.isArray(arr) ? arr : [];
    if (isAll) return a;
    const start = (safePage - 1) * size;
    return a.slice(start, start + size);
  }, [isAll, safePage, size]);

  // alias de compatibilidad (si tienes vistas que aún usan ctx.pager)
  const pager = useMemo(() => ({
    page: safePage, setPage,
    pageSize, setPageSize,
    totalPages, isAll, from, to, slice,
  }), [safePage, pageSize, setPageSize, totalPages, isAll, from, to, slice, setPage]);

  const value = useMemo(() => ({
    // API actual
    page: safePage, setPage,
    pageSize, setPageSize,
    total, setTotal,
    labelText, setLabel, setLabelText: setLabel, // alias útil
    totalPages, isAll, from, to,
    slice,
    // visibilidad global
    visible, register,
    // compatibilidad
    pager,
  }), [safePage, setPage, pageSize, setPageSize, total, setTotal, labelText, setLabel, totalPages, isAll, from, to, slice, visible, register, pager]);

  return <PaginationContext.Provider value={value}>{children}</PaginationContext.Provider>;
}

export function usePaginationContext() {
  const ctx = useContext(PaginationContext);
  if (ctx) return ctx;

  // Fallback seguro si alguien usa el hook fuera del provider
  const noop = () => {};
  const stubSlice = (a) => (Array.isArray(a) ? a : []);
  const pager = { page: 1, setPage: noop, pageSize: 10, setPageSize: noop, totalPages: 1, isAll: false, from: 0, to: 0, slice: stubSlice };
  return {
    page: 1, setPage: noop,
    pageSize: 10, setPageSize: noop,
    total: 0, setTotal: noop,
    labelText: 'elementos', setLabel: noop, setLabelText: noop,
    totalPages: 1, isAll: false, from: 0, to: 0,
    slice: stubSlice,
    visible: false,
    register: () => noop,
    pager,
  };
}
