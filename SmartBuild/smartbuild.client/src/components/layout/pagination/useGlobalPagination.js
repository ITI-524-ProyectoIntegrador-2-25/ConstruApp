import { usePaginationContext } from './PaginationProvider';

/**
 * Hook delgado que solo reexporta el contexto
 * (evita dependencias con Router/DOM).
 */
export default function useGlobalPagination(opts = {}) {
  const { pager, setPage, setPageSize, setTotal, setLoading } = usePaginationContext();
  if (opts.pageSize && pager.pageSize !== opts.pageSize) {
    // opcional: respetar pageSize inicial si se pasa por props
  }
  return { pager, setPage, setPageSize, setTotal, setLoading };
}
