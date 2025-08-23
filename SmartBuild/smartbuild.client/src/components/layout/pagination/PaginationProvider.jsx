
import React, { createContext, useContext, useState, useCallback } from 'react';
const Ctx = createContext(null);
export function PaginationProvider({ children }) {
  const [state, setState] = useState({ page:1, pageSize:10, total:0, loading:false, pageSizeOptions:[10,25,50,100], onChange:null });
  const register = useCallback((cfg) => { setState(s => ({ ...s, ...cfg })); return () => setState(s => ({ ...s, page:1, pageSize:10, total:0 })); }, []);
  const update = useCallback((patch) => setState(s => ({ ...s, ...patch })), []);
  return <Ctx.Provider value={{ state, register, update }}>{children}</Ctx.Provider>;
}
export function usePaginationContext(){ const ctx = useContext(Ctx); if(!ctx) throw new Error('PaginationProvider faltante'); return ctx; }
