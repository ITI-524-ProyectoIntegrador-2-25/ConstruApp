// Dashboard.jsx
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, ChevronLeft, ClipboardList, Grid3X3, List, Plus, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react';

// Hook
import { usePresupuestos } from '../../../hooks/dashboard';
import { useGlobalPagination } from '../../layout/pagination';

function getInitials(nombre = '') {
  const parts = String(nombre).split(' ');
  const a = (parts[0] || '').charAt(0).toUpperCase();
  const b = (parts[1] || '').charAt(0).toUpperCase();
  return (a + b) || 'PL';
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0
  }).format(amount);
};

function formatShort(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('es-CR', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function getStatusBadgeClass(status) {
  switch (status.toLowerCase()) {
    case 'completado':
    case 'terminado':
    case 'pagado':
      return 'bg-success';
    case 'en proceso':
    case 'pendiente':
      return 'bg-warning';
    case 'cancelado':
    case 'retrasado':
      return 'bg-danger';
    default:
      return 'bg-primary';
  }
};

function dateDuration(fecha1, fecha2) {
  const f1 = new Date(fecha1);
  const f2 = new Date(fecha2);

  // Calcula meses
  let meses = (f2.getFullYear() - f1.getFullYear()) * 12;
  meses += f2.getMonth() - f1.getMonth();

  // Ajuste si los días del mes afectan la diferencia
  if (f2.getDate() < f1.getDate()) {
    meses--;
  }

  // Si es menos de un mes, calculamos días
  if (meses < 1) {
    const diffTime = Math.abs(f2 - f1);
    const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return `${dias} día${dias !== 1 ? 's' : ''}`;
  }

  return `${meses} mes${meses !== 1 ? 'es' : ''}`;
}

export default function Dashboard() {
  const navigate = useNavigate()

  const { presupuestos, loading, error } = usePresupuestos();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Estado unificado para filtros
  const [filtros, setFiltros] = useState({
    descripcion: '',
    fecha: ''
  })

  // Funcion para filtado en tiempo real con usememo
  const results = useMemo(() => {
    let arr = presupuestos
    //filtra por descripcion
    if (filtros.descripcion) {
      const q = filtros.descripcion.toLowerCase()
      arr = arr.filter(p =>
        (p.descripcion || '').toLowerCase().includes(q)
      )
    }

    // Filtro por fecha
    if (filtros.fecha) {
      arr = arr.filter(p =>
        new Date(p.fechaInicio).toISOString().slice(0, 10) === filtros.fecha
      )
    }

    return arr
  }, [presupuestos, filtros.descripcion, filtros.fecha])

  // Paginación global: publica el total y etiqueta, y obtiene el "slice" paginado
  const { slice, setTotal, setLabel } = useGlobalPagination({ total: results.length, label: 'proyectos' });

  useEffect(() => {
    setTotal(results.length);
    setLabel('proyectos');
  }, [results.length, setTotal, setLabel]);

  const pagedResults = useMemo(() => slice(results), [results, slice]);

  // Handler unificado para todos los filtros
  const handleFilterChange = (field) => (e) => {
    setFiltros(current => ({
      ...current,
      [field]: e.target.value
    }))
  }

  const hasActiveFilters = filtros.descripcion || filtros.fecha

  // Función para limpiar filtros
  const clearFilters = () => {
    setFiltros({
      descripcion: '',
      fecha: ''
    })
  }

  if (loading) return <p>Cargando…</p>
  if (error) return <p className="dashboard-error">{error}</p>

  return (
    <div className="dashboard-page">
      {/* Encabezado */}
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} title="Volver">
            <ChevronLeft size={20} />
          </button>
          <div className="title-section">
            <h1 className="page-title">
              <ClipboardList size={28} />
              Proyectos
            </h1>
            <p className="page-subtitle">Gestiona los presupuestos de los proyectos</p>
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

          <Link to="/dashboard/proyectos/editar/0" className="btn-primary-modern">
            <Plus size={16} />
            Agregar proyecto
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            <div className="filter-row">
              <div className="filter-field">
                <label>Buscar proyecto</label>
                <div className="input-with-icon">
                  <Search size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Nombre..."
                    value={filtros.descripcion}
                    onChange={handleFilterChange('descripcion')}
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
                    value={filtros.fecha}
                    onChange={handleFilterChange('fecha')}
                    className="modern-input"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="filter-actions">
                <button onClick={clearFilters} className="btn-clear">
                  Limpiar filtros
                </button>
                <span className="results-count">
                  {results.length} de {presupuestos.length} proyectos
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
            <span className="stat-number">{presupuestos.length}</span>
            <span className="stat-label">Total proyectos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {presupuestos.filter(p => String(p?.estado || '').toLowerCase().includes('cerr')).length}
            </span>
            <span className="stat-label">Cerrados</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon inactive">
            <XCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {presupuestos.filter(p => !String(p?.estado || '').toLowerCase().includes('abie')).length}
            </span>
            <span className="stat-label">Abiertos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Eye size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{presupuestos.length}</span>
            <span className="stat-label">Mostrando</span>
          </div>
        </div>
      </div>

      <div className={`projects-container ${viewMode}`}>
          {results.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="projects-grid">
                {pagedResults.map(p => {
                  const duration = dateDuration(p.fechaFin, p.fechaInicio);
                  return (
                    <NavLink
                      key={p.idPresupuesto}
                      to={`proyectos/${p.idPresupuesto}`}
                      className="project-card"
                    >
                      <div className="card-image">
                        <img
                          src={require('../../../assets/img/dashboard.png')}
                          alt={p.descripcion}
                        />
                      </div>
                      <div className="card-info">
                        <h3>{p.descripcion}</h3>
                        <h4>{formatCurrency(p.montoProyecto)}</h4>
                        <div className='row' style={{display: '-webkit-inline-box'}}>
                          <p
                            style={{width: '75%'}}
                          >
                            {p.nombreCliente}
                          </p>
                          <p
                            style={{width: '75%'}}
                          >
                            <Clock size={14} />{' '}{duration}
                          </p>
                        </div>
                        
                        <div className='row' style={{display: '-webkit-inline-box'}}>
                          <p
                            style={{width: '75%'}}
                          >
                            <Calendar size={14} />{' '}
                            {new Date(p.fechaInicio).toLocaleDateString()}
                          </p>
                          <p
                            style={{width: '60%'}}
                          >
                            <Calendar size={14} />{' '}
                            {new Date(p.fechaFin).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            ) : (
              <div className="empleados-table">
                <div className="table-header">
                  <div className="table-cell">Proyecto</div>
                  <div className="table-cell">Cliente</div>
                  <div className="table-cell">Fechas</div>
                  <div className="table-cell">Duración</div>
                  <div className="table-cell">Estado</div>
                </div>

                {pagedResults.map(p => {
                  const duration = dateDuration(p.fechaFin, p.fechaInicio)

                  return (
                    <NavLink
                      key={p.idPresupuesto}
                      to={`proyectos/${p.idPresupuesto}`}
                      className="project-table table-row"
                    >
                      <div className="table-cell employee-info">
                        <div className="employee-avatar small me-3">
                          <span className="avatar-text">{getInitials(p?.descripcion || '')}</span>
                        </div>
                        <div className="employee-text">
                          <span className="name">{p?.descripcion || `Presupuesto #${p.idPresupuesto}`}</span>
                          <span className="email">#{p.idPresupuesto}</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className="date">
                          {p.nombreCliente}
                        </span>
                      </div>
                      <div className="table-cell">
                        <span className="text">
                          <Calendar size={14} /> {formatShort(p?.fechaInicio)} — {formatShort(p?.fechaFin)}
                        </span>
                      </div>
                      <div className="table-cell">
                      <span className="position-tag">
                        {duration}
                      </span>
                    </div>
                      <div className="table-cell">
                        <span
                          style={{ position: 'relative', padding: 'inherit', fontSize: '1rem' }} 
                          className={`${getStatusBadgeClass(p.estado)} badge rounded-pill`}>
                            { p.estado }
                          </span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            )
          ) : (
            <p className="no-results">
              {filtros.descripcion || filtros.fecha
                ? 'No se encontraron proyectos con los filtros aplicados'
                : 'No se encontraron proyectos'
              }
            </p>
          )}
      </div>
    </div>
  )
}