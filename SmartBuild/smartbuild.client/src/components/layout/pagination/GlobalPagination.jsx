import React from 'react';
import { usePaginationContext } from './PaginationProvider';

/**
 * Controles accesibles. Usa <button type="button"> y NO <a href="#">.
 * No hace preventDefault global ni captura clicks del padre.
 */
export default function GlobalPagination({ hideOnSinglePage = true, pageSizeOptions = [10, 25, 50, 100] }) {
  const { pager, setPage, setPageSize } = usePaginationContext();
  const { page, totalPages, total, pageSize } = pager;

  if (hideOnSinglePage && totalPages <= 1) return null;

  const go = (p) => setPage(Math.min(totalPages, Math.max(1, p)));

  return (
    <nav
      className="global-pagination"
      aria-label="Paginación"
      // Evita que una tabla clickable trague el click de estos botones,
      // pero NO bloquea los <Link> del resto de la vista.
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 0' }}
    >
      <button type="button" onClick={() => go(1)} disabled={page <= 1}>{'«'}</button>
      <button type="button" onClick={() => go(page - 1)} disabled={page <= 1}>{'‹'}</button>

      <span style={{ whiteSpace: 'nowrap' }}>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </span>

      <button type="button" onClick={() => go(page + 1)} disabled={page >= totalPages}>{'›'}</button>
      <button type="button" onClick={() => go(totalPages)} disabled={page >= totalPages}>{'»'}</button>

      <span style={{ marginLeft: 12 }}>Items: {total}</span>

      <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Tamaño:
        <select
          value={pageSize}
          onChange={(e) => {
            const ps = parseInt(e.target.value, 10) || 10;
            setPageSize(ps);
            setPage(1); // reset a la primera página
          }}
        >
          {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </nav>
  );
}
