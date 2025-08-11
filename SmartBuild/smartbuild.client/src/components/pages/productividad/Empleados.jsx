import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Calendar, 
  Plus, 
  Users, 
  Grid3X3, 
  List,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import '../../../styles/Dashboard.css';
import './Empleados.css';

// ✅ Importa el hook
import { useEmpleados } from '../../../hooks/Empleados';

export default function Empleados() {
  const navigate = useNavigate();
  
  // ✅ Hook en lugar de useEffect + fetch
  const { Empleados, loading, error } = useEmpleados();

  // Estados para filtros y vista
  const [results, setResults] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroPuesto, setFiltroPuesto] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Aplica filtros cuando cambian
  useEffect(() => {
    let arr = [...Empleados];

    if (filtroNombre.trim()) {
      const q = filtroNombre.toLowerCase();
      arr = arr.filter(e =>
        (`${e.nombre} ${e.apellido}` || '').toLowerCase().includes(q) ||
        (e.identificacion || '').toLowerCase().includes(q)
      );
    }

    if (filtroPuesto.trim()) {
      arr = arr.filter(e =>
        (e.puesto || '').toLowerCase().includes(filtroPuesto.toLowerCase())
      );
    }

    if (filtroFecha) {
      arr = arr.filter(e => {
        try {
          return new Date(e.fechaIngreso).toISOString().slice(0, 10) === filtroFecha;
        } catch {
          return false;
        }
      });
    }

    if (filtroEstado) {
      arr = arr.filter(e => {
        const isActive = e.activo === 1 || e.activo === '1' || e.activo === true || e.activo === 'True';
        return filtroEstado === 'activo' ? isActive : !isActive;
      });
    }

    // Ordenar por nombre
    arr.sort((a, b) => (`${a.nombre} ${a.apellido}`).localeCompare(`${b.nombre} ${b.apellido}`));
    
    setResults(arr);
  }, [Empleados, filtroNombre, filtroPuesto, filtroFecha, filtroEstado]);

  const clearFilters = () => {
    setFiltroNombre('');
    setFiltroPuesto('');
    setFiltroFecha('');
    setFiltroEstado('');
  };

  const hasActiveFilters = filtroNombre || filtroPuesto || filtroFecha || filtroEstado;

  const formatSalary = (salary) => {
    if (!salary) return 'No especificado';
    return `₡${parseFloat(salary).toLocaleString('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'No especificado';
    try {
      return new Date(date).toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const isEmployeeActive = (activo) => {
    return activo === 1 || activo === '1' || activo === true || activo === 'True';
  };

  const getInitials = (nombre, apellido) => {
    const n = (nombre || '').charAt(0).toUpperCase();
    const a = (apellido || '').charAt(0).toUpperCase();
    return `${n}${a}` || 'EM';
  };

  if (loading) {
    return (
      <div className="empleados-loading">
        <div className="loading-spinner"></div>
        <p>Cargando empleados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empleados-error">
        <XCircle size={48} className="error-icon" />
        <h2>Error al cargar empleados</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="empleados-page-modern">
      {/* Header Mejorado */}
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} title="Volver">
            <ChevronLeft size={20} />
          </button>
          <div className="title-section">
            <h1 className="page-title">
              <Users size={28} />
              Empleados
            </h1>
            <p className="page-subtitle">
              Gestiona tu equipo de trabajo
            </p>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-secondary-modern"
            onClick={() => setShowFilters(!showFilters)}
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
          
          <Link to="nuevo" className="btn-primary-modern">
            <Plus size={16} />
            Agregar empleado
          </Link>
        </div>
      </div>

      {/* Panel de Filtros Mejorado */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-content">
            <div className="filter-row">
              <div className="filter-field">
                <label>Buscar empleado</label>
                <div className="input-with-icon">
                  <Search size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Nombre, apellido o identificación..."
                    value={filtroNombre}
                    onChange={e => setFiltroNombre(e.target.value)}
                    className="modern-input"
                  />
                </div>
              </div>
              
              <div className="filter-field">
                <label>Puesto</label>
                <div className="input-with-icon">
                  <Filter size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Filtrar por puesto..."
                    value={filtroPuesto}
                    onChange={e => setFiltroPuesto(e.target.value)}
                    className="modern-input"
                  />
                </div>
              </div>
              
              <div className="filter-field">
                <label>Fecha de ingreso</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input
                    type="date"
                    value={filtroFecha}
                    onChange={e => setFiltroFecha(e.target.value)}
                    className="modern-input"
                  />
                </div>
              </div>
              
              <div className="filter-field">
                <label>Estado</label>
                <select 
                  value={filtroEstado} 
                  onChange={e => setFiltroEstado(e.target.value)}
                  className="modern-select"
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="filter-actions">
                <button onClick={clearFilters} className="btn-clear">
                  Limpiar filtros
                </button>
                <span className="results-count">
                  {results.length} de {Empleados.length} empleados
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estadísticas Rápidas */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{Empleados.length}</span>
            <span className="stat-label">Total empleados</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {Empleados.filter(e => isEmployeeActive(e.activo)).length}
            </span>
            <span className="stat-label">Activos</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon inactive">
            <XCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {Empleados.filter(e => !isEmployeeActive(e.activo)).length}
            </span>
            <span className="stat-label">Inactivos</span>
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

      {/* Lista/Grid de Empleados */}
      <div className={`empleados-container ${viewMode}`}>
        {results.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="empleados-grid">
              {results.map(emp => (
                <NavLink
                  key={emp.idEmpleado}
                  to={`${emp.idEmpleado}`}
                  className="employee-card-modern"
                >
                  <div className="card-header">
                    <div className="employee-avatar">
                      <span className="avatar-text">
                        {getInitials(emp.nombre, emp.apellido)}
                      </span>
                    </div>
                    <div className={`status-indicator ${isEmployeeActive(emp.activo) ? 'active' : 'inactive'}`}>
                      {isEmployeeActive(emp.activo) ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="employee-name">
                      {emp.nombre} {emp.apellido}
                    </h3>
                    <p className="employee-position">{emp.puesto || 'Sin puesto asignado'}</p>
                    
                    <div className="employee-details">
                      <div className="detail-item">
                        <span className="detail-label">ID:</span>
                        <span className="detail-value">{emp.identificacion}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Salario/h:</span>
                        <span className="detail-value">{formatSalary(emp.salarioHora)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Ingreso:</span>
                        <span className="detail-value">{formatDate(emp.fechaIngreso)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <span className={`status-badge ${isEmployeeActive(emp.activo) ? 'active' : 'inactive'}`}>
                      {isEmployeeActive(emp.activo) ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="empleados-table">
              <div className="table-header">
                <div className="table-cell">Empleado</div>
                <div className="table-cell">Puesto</div>
                <div className="table-cell">Identificación</div>
                <div className="table-cell">Salario/h</div>
                <div className="table-cell">Fecha ingreso</div>
                <div className="table-cell">Estado</div>
                <div className="table-cell">Acciones</div>
              </div>
              
              {results.map(emp => (
                <NavLink
                  key={emp.idEmpleado}
                  to={`${emp.idEmpleado}`}
                  className="table-row"
                >
                  <div className="table-cell employee-info">
                    <div className="employee-avatar small">
                      <span className="avatar-text">
                        {getInitials(emp.nombre, emp.apellido)}
                      </span>
                    </div>
                    <div className="employee-text">
                      <span className="name">{emp.nombre} {emp.apellido}</span>
                      <span className="email">{emp.correo || 'Sin email'}</span>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <span className="position-tag">{emp.puesto || 'Sin puesto'}</span>
                  </div>
                  
                  <div className="table-cell">
                    <span className="id-badge">{emp.identificacion}</span>
                  </div>
                  
                  <div className="table-cell">
                    <span className="salary">{formatSalary(emp.salarioHora)}</span>
                  </div>
                  
                  <div className="table-cell">
                    <span className="date">{formatDate(emp.fechaIngreso)}</span>
                  </div>
                  
                  <div className="table-cell">
                    <span className={`status-badge ${isEmployeeActive(emp.activo) ? 'active' : 'inactive'}`}>
                      {isEmployeeActive(emp.activo) ? (
                        <>
                          <CheckCircle size={12} />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          Inactivo
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="table-cell">
                    <button className="action-button" onClick={(e) => e.preventDefault()}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </NavLink>
              ))}
            </div>
          )
        ) : (
          <div className="empty-state">
            <Users size={64} className="empty-icon" />
            <h3>No se encontraron empleados</h3>
            <p>
              {hasActiveFilters 
                ? 'Intenta ajustar los filtros para encontrar lo que buscas.'
                : 'Aún no tienes empleados registrados.'
              }
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn-secondary-modern">
                Limpiar filtros
              </button>
            ) : (
              <Link to="nuevo" className="btn-primary-modern">
                <Plus size={16} />
                Agregar primer empleado
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}