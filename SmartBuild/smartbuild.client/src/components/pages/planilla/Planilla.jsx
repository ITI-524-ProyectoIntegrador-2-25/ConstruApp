// src/components/pages/planilla/Planillas.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  Filter,
  Calendar,
  Plus,
  ClipboardList,
  Grid3X3,
  List,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import '../../../styles/Dashboard.css';
import './css/Planilla.css';
import { usePlanillas } from '../../../hooks/Planilla';
import dashboardImg from '../../../assets/img/dashboard.png';

function toISODateOnly(d) {
  const dt = d ? new Date(d) : null;
  if (!dt || Number.isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function formatShort(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}
function daysBetween(a, b) {
  const d1 = new Date(a), d2 = new Date(b);
  if (Number.isNaN(d1) || Number.isNaN(d2)) return null;
  return Math.max(1, Math.round((d2 - d1) / 86400000) + 1);
}
function durBadgeColor(estado) {
  const e = String(estado || '').toLowerCase();
  if (e.includes('cerr')) return 'success';
  if (e.includes('proce') || e.includes('revi')) return 'warning';
  return 'primary';
}
function getInitials(nombre = '') {
  const parts = String(nombre).split(' ');
  const a = (parts[0] || '').charAt(0).toUpperCase();
  const b = (parts[1] || '').charAt(0).toUpperCase();
  return (a + b) || 'PL';
}

export default function Planillas() {
  const navigate = useNavigate();
  const { Planillas, loading, error } = usePlanillas();

  // Estado UI / filtros
  const [results, setResults] = useState([]);
  const [q, setQ] = useState('');
  const [fFecha, setFFecha] = useState('');
  const [fEstado, setFEstado] = useState('');
  const [orden, setOrden] = useState('recientes');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(false);

const data = useMemo(
  () => (Array.isArray(Planillas) ? Planillas : []),
  [Planillas]
);

  const estados = useMemo(() => {
    const s = new Set(data.map(p => p?.estado).filter(Boolean));
    return ['', ...Array.from(s)];
  }, [data]);

  // Filtrado y orden
  useEffect(() => {
    let arr = [...data];

    if (q.trim()) {
      const k = q.toLowerCase();
      arr = arr.filter(p =>
        (p?.nombre || '').toLowerCase().includes(k) ||
        String(p?.idPlanilla || '').includes(k)
      );
    }
    if (fFecha) {
      arr = arr.filter(p => toISODateOnly(p?.fechaInicio) === fFecha);
    }
    if (fEstado) {
      arr = arr.filter(p => (p?.estado || '') === fEstado);
    }

    // Orden
    arr.sort((a, b) => {
      switch (orden) {
        case 'az': return String(a?.nombre || '').localeCompare(String(b?.nombre || ''));
        case 'za': return String(b?.nombre || '').localeCompare(String(a?.nombre || ''));
        case 'antiguas': {
          const da = new Date(a?.fechaInicio || 0).getTime();
          const db = new Date(b?.fechaInicio || 0).getTime();
          return da - db;
        }
        default: {
          const da = new Date(a?.fechaInicio || 0).getTime();
          const db = new Date(b?.fechaInicio || 0).getTime();
          return db - da; // recientes
        }
      }
    });

    setResults(arr);
  }, [data, q, fFecha, fEstado, orden]);

  const clearFilters = () => {
    setQ('');
    setFFecha('');
    setFEstado('');
    setOrden('recientes');
  };

  const hasActiveFilters = q || fFecha || fEstado || orden !== 'recientes';

  if (loading) {
    return (
      <div className="empleados-loading">
        <div className="loading-spinner"></div>
        <p>Cargando planillas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empleados-error">
        <XCircle size={48} className="error-icon" />
        <h2>Error al cargar planillas</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="empleados-page-modern">
      {/* Encabezado */}
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} title="Volver">
            <ChevronLeft size={20} />
          </button>
          <div className="title-section">
            <h1 className="page-title">
              <ClipboardList size={28} />
              Planillas
            </h1>
            <p className="page-subtitle">Gestiona tus periodos de pago</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary-modern"
            onClick={() => setShowFilters(v => !v)}
            title="Filtros"
          >
            <Filter size={16} />
            Filtros
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista en cuadrícula"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Vista en lista"
            >
              <List size={16} />
            </button>
          </div>

          <Link to="nueva" className="btn-primary-modern">
            <Plus size={16} />
            Nueva planilla
          </Link>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            <div className="filter-row">
              <div className="filter-field">
                <label>Buscar planilla</label>
                <div className="input-with-icon">
                  <Search size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Nombre o # de planilla..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="filter-field">
                <label>Fecha de inicio</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input
                    type="date"
                    value={fFecha}
                    onChange={e => setFFecha(e.target.value)}
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="filter-field">
                <label>Estado</label>
                <select
                  value={fEstado}
                  onChange={e => setFEstado(e.target.value)}
                  className="modern-select"
                >
                  <option value="">Todos</option>
                  {estados.filter(Boolean).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>Orden</label>
                <select
                  value={orden}
                  onChange={e => setOrden(e.target.value)}
                  className="modern-select"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="antiguas">Más antiguas</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="filter-actions">
                <button onClick={clearFilters} className="btn-clear">
                  Limpiar filtros
                </button>
                <span className="results-count">
                  {results.length} de {data.length} planillas
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas rápidas */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <ClipboardList size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{data.length}</span>
            <span className="stat-label">Total planillas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {data.filter(p => String(p?.estado || '').toLowerCase().includes('cerr')).length}
            </span>
            <span className="stat-label">Cerradas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon inactive">
            <XCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {data.filter(p => !String(p?.estado || '').toLowerCase().includes('cerr')).length}
            </span>
            <span className="stat-label">Abiertas/otras</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Eye size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{results.length}</span>
            <span className="stat-label">Mostrando</span>
          </div>
        </div>
      </div>

      {/* Contenido: grid o lista */}
      <div className={`empleados-container ${viewMode}`}>
        {results.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="empleados-grid">
              {results.map(p => {
                const inicio = p?.fechaInicio;
                const fin = p?.fechaFin;
                const dur = daysBetween(inicio, fin);
                const estado = p?.estado || '—';
                const badgeClass = `status-badge ${durBadgeColor(estado)}`;

                return (
                  <NavLink key={p.idPlanilla} to={`${p.idPlanilla}`} className="employee-card-modern">
                    <div className="card-header">
                      <div className="employee-avatar">
                        <span className="avatar-text">{getInitials(p?.nombre || '')}</span>
                      </div>
                      <span className={badgeClass}>{estado}</span>
                    </div>

                    <div className="card-content">
                      <h3 className="employee-name">{p?.nombre || `Planilla #${p.idPlanilla}`}</h3>
                      <p className="employee-position">#{p.idPlanilla}</p>

                      <div className="employee-details">
                        <div className="detail-item">
                          <span className="detail-label">Inicio</span>
                          <span className="detail-value">{formatShort(inicio)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Fin</span>
                          <span className="detail-value">{formatShort(fin)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Duración</span>
                          <span className="detail-value">{dur ? `${dur} día${dur !== 1 ? 's' : ''}` : '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <img src={dashboardImg} alt="Planilla" style={{ width: 24, height: 24, opacity: .9 }} />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          ) : (
            <div className="empleados-table">
              <div className="table-header">
                <div className="table-cell">Planilla</div>
                <div className="table-cell">Rango</div>
                <div className="table-cell">Duración</div>
                <div className="table-cell">Estado</div>
                <div className="table-cell">Acciones</div>
              </div>

              {results.map(p => {
                const inicio = p?.fechaInicio;
                const fin = p?.fechaFin;
                const dur = daysBetween(inicio, fin);
                const estado = p?.estado || '—';
                const badgeClass = `status-badge ${durBadgeColor(estado)}`;

                return (
                  <NavLink key={p.idPlanilla} to={`${p.idPlanilla}`} className="table-row">
                    <div className="table-cell employee-info">
                      <div className="employee-avatar small">
                        <span className="avatar-text">{getInitials(p?.nombre || '')}</span>
                      </div>
                      <div className="employee-text">
                        <span className="name">{p?.nombre || `Planilla #${p.idPlanilla}`}</span>
                        <span className="email">#{p.idPlanilla}</span>
                      </div>
                    </div>

                    <div className="table-cell">
                      <span className="date">
                        <Calendar size={14} /> {formatShort(inicio)} — {formatShort(fin)}
                      </span>
                    </div>

                    <div className="table-cell">
                      <span className="position-tag">
                        {dur ? `${dur} día${dur !== 1 ? 's' : ''}` : '—'}
                      </span>
                    </div>

                    <div className="table-cell">
                      <span className={badgeClass}>{estado}</span>
                    </div>

                    <div className="table-cell">
                      <button className="action-button" onClick={(e) => e.preventDefault()}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          )
        ) : (
          <div className="empty-state">
            <ClipboardList size={64} className="empty-icon" />
            <h3>No se encontraron planillas</h3>
            <p>
              {hasActiveFilters
                ? 'Ajusta los filtros para ver resultados.'
                : 'Aún no tienes planillas registradas.'}
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn-secondary-modern">
                Limpiar filtros
              </button>
            ) : (
              <Link to="nueva" className="btn-primary-modern">
                <Plus size={16} />
                Crear primera planilla
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
