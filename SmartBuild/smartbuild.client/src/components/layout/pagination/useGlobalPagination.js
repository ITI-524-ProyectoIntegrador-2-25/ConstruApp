// src/components/layout/pagination/useGlobalPagination.js
import { useEffect, useMemo } from 'react';
import { usePaginationContext } from './PaginationProvider';

export default function useGlobalPagination(opts = {}) {
  const {
    enabled = true,           // << si false, no se registra ni se muestra la barra
    total: totalProp,         // opcional: puedes pasar total/label directamente
    label,
  } = opts;

  const ctx = usePaginationContext();
  const { register, setTotal, setLabel, slice, pager } = ctx;

  // registro / auto-ocultar
  useEffect(() => {
    if (!enabled) return;
    const unregister = register();
    return unregister;
  }, [enabled, register]);

  // si te pasan total/label por props, publícalos
  useEffect(() => {
    if (!enabled) return;
    if (typeof totalProp === 'number') setTotal(totalProp);
    if (typeof label === 'string') setLabel(label);
  }, [enabled, totalProp, label, setTotal, setLabel]);

  // API inerte si está deshabilitado
  const disabledApi = useMemo(() => ({
    slice: (a) => (Array.isArray(a) ? a : []),
    setTotal: () => {},
    setLabel: () => {},
    pager: { page: 1, pageSize: (Array.isArray(totalProp) ? totalProp.length : 10), setPage: () => {} },
  }), [totalProp]);

  return enabled ? { slice, setTotal, setLabel, pager } : disabledApi;
}
