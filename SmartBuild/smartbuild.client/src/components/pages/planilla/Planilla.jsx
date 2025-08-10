// src/components/pages/planilla/Planillas.jsx
import React, { useMemo, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Calendar, Filter, ChevronLeft } from 'lucide-react';
import '../../../styles/Dashboard.css';
import './Planilla.css';
import { usePlanillas } from '../../../hooks/Planilla';
import dashboardImg from '../../../assets/img/dashboard.png';

function toISODateOnly(d) {
  const date = d ? new Date(d) : null;
  if (!date || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function formatShort(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return '';
  return date.toLocaleDateString();
}
function Highlight({ text, q }) {
  if (!q) return <>{text}</>;
  const i = String(text || '').toLowerCase();
  const k = q.toLowerCase();
  const idx = i.indexOf(k);
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + k.length);
  const after = text.slice(idx + k.length);
  return (
    <>
      {before}
      <mark style={{ background: '#fde68a', padding: '0 .15em', borderRadius: 4 }}>{match}</mark>
      {after}
    </>
  );
}

export default function Planillas() {
  const navigate = useNavigate();
  const { Planillas, loading, error } = usePlanillas();

  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [orden, setOrden] = useState('recientes');

  const data = Array.isArray(Planillas) ? Planillas : [];

  const estados = useMemo(() => {
    const s = new Set(data.map(p => p?.estado).filter(Boolean));
    return ['Todos', ...Array.from(s)];
  }, [data]);

  const results = useMemo(() => {
    const q = filtroNombre.trim().toLowerCase();
    const f = filtroFecha.trim();
    const e = filtroEstado;

    let arr = data.filter(p => {
      const nombreOk = q === '' || (p?.nombre || '').toLowerCase().includes(q);
      const fechaOk = f === '' || toISODateOnly(p?.fechaInicio) === f;
      const estadoOk = e === 'Todos' || p?.estado === e;
      return nombreOk && fechaOk && estadoOk;
    });

    arr = arr.slice().sort((a, b) => {
      if (orden === 'az') return String(a?.nombre || '').localeCompare(String(b?.nombre || ''));
      if (orden === 'za') return String(b?.nombre || '').localeCompare(String(a?.nombre || ''));
      const da = new Date(a?.fechaInicio || 0).getTime();
      const db = new Date(b?.fechaInicio || 0).getTime();
      return orden === 'antiguas' ? da - db : db - da;
    });

    return arr;
  }, [data, filtroNombre, filtroFecha, filtroEstado, orden]);

  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroFecha('');
    setFiltroEstado('Todos');
    setOrden('recientes');
  };

  if (loading) return <p>Cargando…</p>;
  if (error) return <p className="dashboard-error">{error}</p>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="title-group">
          <button className="back-btn" onClick={() => navigate(-1)} title="Volver" aria-label="Volver">
            <ChevronLeft size={20} />
          </button>
          <h1 className="dashboard-title">Planillas</h1>
        </div>
      </header>

      <div className="dashboard-filters">
        <div className="filter-group" aria-label="Buscar por nombre">
          <input
            type="text"
            placeholder="Buscar nombre"
            value={filtroNombre}
            onChange={e => setFiltroNombre(e.target.value)}
          />
        </div>

        <div className="filter-group" aria-label="Filtrar por fecha de inicio">
          <Calendar className="filter-icon" />
          <input
            type="date"
            value={filtroFecha}
            onChange={e => setFiltroFecha(e.target.value)}
          />
        </div>

        <div className="filter-group" aria-label="Filtrar por estado">
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            {estados.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="filter-group" aria-label="Ordenar resultados">
          <select value={orden} onChange={e => setOrden(e.target.value)}>
            <option value="recientes">Más recientes</option>
            <option value="antiguas">Más antiguas</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>

        <button className="btn-icon" title="Filtros avanzados" onClick={e => e.preventDefault()}>
          <Filter />
        </button>

        <button className="btn-search" onClick={limpiarFiltros}>Limpiar</button>

        <Link to="nueva" className="btn-add">+ Nueva planilla</Link>
      </div>

      <p style={{ color: 'var(--clr-muted)', marginBottom: '1rem' }}>
        Resultados: <strong>{results.length}</strong>
      </p>

      <div className="projects-grid">
        {results.length > 0 ? (
          results.map(p => {
            const inicio = p?.fechaInicio ? new Date(p.fechaInicio) : null;
            const fin = p?.fechaFin ? new Date(p.fechaFin) : null;
            const estado = p?.estado || '';
            const badgeBg =
              estado === 'Cerrada' ? '#059669' :
              estado === 'Revisión' ? '#f59e0b' :
              '#2563eb';

            return (
              <NavLink key={p.idPlanilla} to={`${p.idPlanilla}`} className="project-card">
                <div className="card-image" style={{ position: 'relative' }}>
                  <img src={dashboardImg} alt={p?.nombre || 'Planilla'} />
                  {estado && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: badgeBg,
                        color: '#fff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: '0 2px 6px rgba(0,0,0,.12)',
                      }}
                    >
                      {estado}
                    </span>
                  )}
                </div>
                <div className="card-info">
                  <h3>
                    <Highlight text={p?.nombre || 'Sin nombre'} q={filtroNombre} />
                  </h3>
                  <p>
                    <Calendar size={14} />{' '}
                    {inicio ? formatShort(inicio) : ''} {fin ? ` – ${formatShort(fin)}` : ''}
                  </p>
                </div>
              </NavLink>
            );
          })
        ) : (
          <div className="no-results" style={{ display: 'grid', gap: '0.75rem' }}>
            <div>No se encontraron planillas con esos filtros.</div>
            <div>
              <button className="btn-search" onClick={limpiarFiltros}>Quitar filtros</button>{' '}
              <Link to="nueva" className="btn-add" style={{ marginLeft: 8 }}>+ Crear nueva</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
