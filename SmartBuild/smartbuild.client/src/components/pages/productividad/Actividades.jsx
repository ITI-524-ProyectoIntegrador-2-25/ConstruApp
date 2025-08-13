import React, { useState, useMemo } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Calendar, Filter, ChevronLeft, Plus, Activity, Clock, CheckCircle, AlertCircle, Pause, Search, Users, Eye } from 'lucide-react';
import { useActividades } from '../../../hooks/Actividades';
import '../../../styles/Dashboard.css';
import './Actividades.css';

export default function Actividades() {
  const navigate = useNavigate();
  const { Actividades, loadingActividades, errorActividades } = useActividades();

  const [filtros, setFiltros] = useState({ 
    presupuesto: null, 
    fecha: '',
    busqueda: '',
    estado: 'todos',
    tipo: 'todos'
  });

  const [vistaActual, setVistaActual] = useState('tarjetas'); // 'tarjetas' o 'lista'

  const handleFilterChange = field => value => {
    setFiltros(f => ({ ...f, [field]: value }));
  };

  const results = useMemo(() => {
    let arr = Actividades;
    
    if (filtros.presupuesto) {
      arr = arr.filter(a => a.descripcion === filtros.presupuesto.value);
    }
    
    if (filtros.fecha) {
      arr = arr.filter(a =>
        new Date(a.fechaInicioReal).toISOString().slice(0, 10) === filtros.fecha
      );
    }

    if (filtros.busqueda) {
      arr = arr.filter(a => 
        a.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }

    if (filtros.estado !== 'todos') {
      arr = arr.filter(a => a.estado === filtros.estado);
    }

    if (filtros.tipo !== 'todos') {
      arr = arr.filter(a => a.tipo === filtros.tipo);
    }
    
    return arr;
  }, [Actividades, filtros]);

  const clearFilters = () => {
    setFiltros({ 
      presupuesto: null, 
      fecha: '',
      busqueda: '',
      estado: 'todos',
      tipo: 'todos'
    });
  };

  // Estadísticas - usando tu lógica original
  const stats = {
    total: Actividades.length,
    enProgreso: Actividades.filter(a => a.estado === 'en-progreso').length,
    completadas: Actividades.filter(a => a.estado === 'completada').length,
    pendientes: Actividades.filter(a => a.estado === 'pendiente').length
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'completada': return '#059669';
      case 'en-progreso': return '#d97706';
      case 'pendiente': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'alta': return '#dc2626';
      case 'media': return '#d97706';
      case 'baja': return '#059669';
      default: return '#6b7280';
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'completada': return <CheckCircle size={16} />;
      case 'en-progreso': return <Clock size={16} />;
      case 'pendiente': return <Pause size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'completada': return 'status-badge--completada';
      case 'en-progreso': return 'status-badge--en-progreso';
      case 'pendiente': return 'status-badge--pendiente';
      default: return 'status-badge--default';
    }
  };

  const getPrioridadClass = (prioridad) => {
    switch(prioridad) {
      case 'alta': return 'priority-badge--alta';
      case 'media': return 'priority-badge--media';
      case 'baja': return 'priority-badge--baja';
      default: return 'priority-badge--default';
    }
  };

  const getTipoIcon = (descripcion) => {
    switch(descripcion) {
      case 'Topografía': return '📐';
      case 'Preparación': return '🚛';
      case 'Estructura': return '🏗️';
      case 'Acabados': return '🎨';
      default: return '🔧';
    }
  };

  if (loadingActividades) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando actividades...</p>
      </div>
    );
  }

  if (errorActividades) {
    return <p className="dashboard-error">{errorActividades}</p>;
  }

  return (
    <div className="actividades-page">
      {/* Header Principal */}
      <header className="actividades-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-left">
              <button 
                onClick={() => navigate(-1)} 
                className="back-btn-modern"
                title="Volver"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="header-title-group">
                <div className="title-with-icon">
                  <Activity size={28} />
                  <h1 className="main-title">Actividades</h1>
                </div>
                <p className="header-subtitle">Gestiona tu equipo de trabajo</p>
              </div>
            </div>
            
            <div className="header-actions">
              <div className="filter-btn-group">
                <Filter className="filter-icon" size={18} />
                <button className="filter-btn">
                  Filtros
                </button>
              </div>
              <button 
                onClick={() => setVistaActual(vistaActual === 'tarjetas' ? 'lista' : 'tarjetas')}
                className="view-toggle-btn"
                title={vistaActual === 'tarjetas' ? 'Vista de lista' : 'Vista de tarjetas'}
              >
                {vistaActual === 'tarjetas' ? '☰' : '▦'}
              </button>
              <Link to="nueva" className="btn-add-modern">
                <Plus size={18} />
                Agregar actividad
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="actividades-container">
        {/* Estadísticas */}
        <div className="stats-grid-modern">
          <div className="stat-card-modern">
            <div className="stat-card-content">
              <div className="stat-icon stat-icon--blue">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">TOTAL ACTIVIDADES</div>
              </div>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-card-content">
              <div className="stat-icon stat-icon--green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{stats.completadas}</div>
                <div className="stat-label">COMPLETADAS</div>
              </div>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-card-content">
              <div className="stat-icon stat-icon--orange">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{stats.enProgreso}</div>
                <div className="stat-label">EN PROGRESO</div>
              </div>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-card-content">
              <div className="stat-icon stat-icon--purple">
                <Eye size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{results.length}</div>
                <div className="stat-label">MOSTRANDO</div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-section">
          <div className="search-content">
            <div className="search-input-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Buscar actividades..."
                value={filtros.busqueda}
                onChange={e => handleFilterChange('busqueda')(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group-horizontal">
              <select
                value={filtros.presupuesto?.value || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('presupuesto')(value ? { value, label: value } : null);
                }}
                className="filter-select-modern"
              >
                <option value="">Filtrar por proyecto…</option>
                {Actividades.map(a => (
                  <option key={a.idActividad} value={a.descripcion}>
                    {a.descripcion}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={filtros.fecha}
                onChange={e => handleFilterChange('fecha')(e.target.value)}
                className="date-input-modern"
              />
            </div>
            
            {(filtros.presupuesto || filtros.fecha || filtros.busqueda || filtros.estado !== 'todos' || filtros.tipo !== 'todos') && (
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Grid de actividades */}
        {vistaActual === 'tarjetas' ? (
          <div className="activities-grid">
            {results.length > 0 ? (
              results.map(a => (
                <NavLink key={a.idActividad} to={`${a.idActividad}`} className="activity-card-modern">
                  <div className="activity-card-image">
                    <img
                      src={require('../../../assets/img/dashboard.png')}
                      alt={a.descripcion}
                      className="card-image"
                    />
                    <div className="card-overlay">
                      <div className="activity-type-badge">
                        <span className="activity-emoji">{getTipoIcon(a.tipo || 'default')}</span>
                        <span>{a.tipo || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="activity-card-content">
                    <div className="activity-card-header">
                      <div className="activity-meta-info">
                        <div className="activity-id">ID: {a.idActividad}</div>
                        <div className="activity-date">
                          <Calendar size={14} />
                          {new Date(a.fechaInicioReal).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short'
                          })}
                        </div>
                      </div>
                      <div className="responsible-avatar">
                        {(a.responsable || 'N/A').substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    <h3 className="activity-title">
                      {a.descripcion.split('–')[0] || a.descripcion}
                    </h3>
                    
                    <div className="activity-details">
                      <div className="activity-detail-row">
                        <span className="detail-label">EQUIPO:</span>
                        <span className="detail-value">
                          <Users size={14} />
                          {a.equipoAsignado || 0} miembros
                        </span>
                      </div>
                      
                      {a.progreso > 0 && (
                        <div className="activity-progress">
                          <div className="progress-info">
                            <span className="progress-label">PROGRESO</span>
                            <span className="progress-percent">{a.progreso}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${a.progreso}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="activity-badges">
                      <div className={`status-badge ${getEstadoClass(a.estado)}`}>
                        {getEstadoIcon(a.estado)}
                        <span>{a.estado}</span>
                      </div>
                      <div className={`priority-badge ${getPrioridadClass(a.prioridad)}`}>
                        {a.prioridad?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </NavLink>
              ))
            ) : (
              <div className="no-results-modern">
                <div className="no-results-icon">🔍</div>
                <h3 className="no-results-title">
                  No se encontraron actividades
                </h3>
                <p className="no-results-text">
                  {filtros.presupuesto || filtros.fecha || filtros.busqueda
                    ? 'No hay actividades con esos filtros'
                    : 'No se encontraron actividades'}
                </p>
                <Link to="nueva" className="no-results-btn">
                  <Plus size={18} />
                  Nueva actividad
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Vista de lista */
          <div className="activities-table-container">
            <div className="activities-table-wrapper">
              <table className="activities-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">ACTIVIDAD</th>
                    <th className="table-header-cell">RESPONSABLE</th>
                    <th className="table-header-cell">ESTADO</th>
                    <th className="table-header-cell">FECHA</th>
                    <th className="table-header-cell">PROGRESO</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {results.map(a => (
                    <tr key={a.idActividad} className="table-row">
                      <td className="table-cell">
                        <div className="table-activity-info">
                          <span className="table-activity-icon">{getTipoIcon(a.tipo || 'default')}</span>
                          <div className="table-activity-details">
                            <div className="table-activity-name">
                              {a.descripcion.split('–')[0] || a.descripcion}
                            </div>
                            <div className="table-activity-type">{a.tipo || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="table-responsible-avatar">
                          {(a.responsable || 'N/A').substring(0, 2).toUpperCase()}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className={`status-badge ${getEstadoClass(a.estado)}`}>
                          {getEstadoIcon(a.estado)}
                          <span>{a.estado}</span>
                        </div>
                      </td>
                      <td className="table-cell table-date">
                        {new Date(a.fechaInicioReal).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="table-cell">
                        <div className="table-progress">
                          <div className="table-progress-bar">
                            <div 
                              className="table-progress-fill"
                              style={{ width: `${a.progreso || 0}%` }}
                            ></div>
                          </div>
                          <span className="table-progress-text">{a.progreso || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        {Actividades.length > 0 && (
          <div className="results-footer-modern">
            <p className="results-text">
              Mostrando <span className="results-highlight">{results.length}</span> de{' '}
              <span className="results-highlight">{Actividades.length}</span>{' '}
              actividad{Actividades.length !== 1 ? 'es' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}