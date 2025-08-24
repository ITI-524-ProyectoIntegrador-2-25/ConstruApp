// src/components/layout/pagination/useGlobalPagination.js
import { useEffect, useMemo } from 'react';
import { usePaginationContext } from './PaginationProvider';

export default function useGlobalPagination(opts = {}) {
  const {
    enabled = true,    // si false, no registra ni muestra la barra
    total: totalProp,  // opcional: publicar total desde props
    label,             // opcional: publicar etiqueta desde props
  } = opts;

  const ctx = usePaginationContext();
  const {
    register,
    setTotal,
    setLabel,
    slice,
    pager,        // { page, pageSize, setPage, ... }
    setPage,      // ⬅️ passthrough estable
    setPageSize,  // ⬅️ passthrough estable
  } = ctx;

  // Registro / auto-ocultar barra global mientras este módulo esté montado
  useEffect(() => {
    if (!enabled) return;
    const unregister = register();
    return unregister;
  }, [enabled, register]);

  // Publicar total/label si se pasan por props
  useEffect(() => {
    if (!enabled) return;
    if (typeof totalProp === 'number') setTotal(totalProp);
    if (typeof label === 'string') setLabel(label);
  }, [enabled, totalProp, label, setTotal, setLabel]);

  // API inerte si está deshabilitado (no truena)
  const disabledApi = useMemo(() => {
    const noop = () => {};
    const id = (a) => (Array.isArray(a) ? a : []);
    return {
      slice: id,
      setTotal: noop,
      setLabel: noop,
      setPage: noop,
      setPageSize: noop,
      pager: { page: 1, pageSize: 10, setPage: noop },
    };
  }, []);

  return enabled
    ? { slice, setTotal, setLabel, setPage, setPageSize, pager }
    : disabledApi;
}
