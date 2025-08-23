
import { useEffect, useMemo } from 'react';
import { usePaginationContext } from './PaginationProvider';
export default function useGlobalPagination(config) {
  const { register, update, state } = usePaginationContext();
  const stable = useMemo(() => ({ page:1, pageSize:10, pageSizeOptions:[10,25,50,100], onChange:null, ...config }), [config]);
  useEffect(() => { const unregister = register(stable); return unregister; }, [register, stable]);
  return {
    pager: state,
    setTotal: (total) => update({ total }),
    setLoading: (loading) => update({ loading }),
    setPage: (page) => { const p = Math.max(1, Number(page||1)); update({ page:p }); state.onChange?.({ page:p, pageSize: state.pageSize }); },
    setPageSize: (pageSize) => { const s = Math.max(1, Number(pageSize||10)); update({ pageSize:s, page:1 }); state.onChange?.({ page:1, pageSize:s }); },
  };
}
