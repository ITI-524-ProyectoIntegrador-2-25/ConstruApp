
import React from 'react';
import { usePaginationContext } from './PaginationProvider';
export default function GlobalPagination(){
  const { state, update } = usePaginationContext();
  const { page, pageSize, total, pageSizeOptions } = state;
  if(!total || total <= pageSize) return null;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const change = (p) => update({ page: Math.min(totalPages, Math.max(1, p)) });
  const pages = []; const maxBtns=6; const start=Math.max(1, page-2); const end=Math.min(totalPages, start+maxBtns-1);
  for(let i=start;i<=end;i++) pages.push(i);
  return (
    <div className="pagination-global d-flex align-items-center justify-content-between px-3 py-2">
      <nav aria-label="Paginación global">
        <ul className="pagination mb-0">
          <li className={`page-item ${page<=1?'disabled':''}`}><button className="page-link" onClick={()=>change(page-1)}>&lt;</button></li>
          {pages.map(n => <li key={n} className={`page-item ${n===page?'active':''}`}><button className="page-link" onClick={()=>change(n)}>{n}</button></li>)}
          <li className={`page-item ${page>=totalPages?'disabled':''}`}><button className="page-link" onClick={()=>change(page+1)}>&gt;</button></li>
        </ul>
      </nav>
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">Mostrando {Math.min(page*pageSize, total)} de {total}</span>
        <select className="form-select form-select-sm" value={pageSize} onChange={(e)=>update({ pageSize:Number(e.target.value), page:1 })} style={{width: 110}}>
          {pageSizeOptions.map(s => <option key={s} value={s}>{s} / pág</option>)}
        </select>
      </div>
    </div>
  );
}
