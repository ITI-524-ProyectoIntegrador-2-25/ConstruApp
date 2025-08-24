import React, { useState, useMemo, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Calendar, Filter, ChevronLeft, Plus, Activity, Clock, CheckCircle, Pause, Search, Users, Ruler, Truck, Building2, Paintbrush, Wrench } from 'lucide-react';
import { useActividades } from '../../../hooks/Actividades';
import { useEmpleados } from '../../../hooks/Empleados'; // ✅ Cambié a useEmpleados (plural)
import '../../../styles/Dashboard.css';
import './Actividades.css';
import './ActividadesGant.css';

export default function Actividades() {
  const navigate = useNavigate();
  const { Actividades, loadingActividades, errorActividades } = useActividades();
  
  // ✅ CORREGIDO: Usar useEmpleados para obtener todos los empleados
  const { Empleados, loading: loadingEmpleados, error: errorEmpleados } = useEmpleados();

  // Referencias para sincronización de scroll
  const timelineHeaderRef = useRef(null);
  const timelineContentRef = useRef(null);

  const [filtros, setFiltros] = useState({ 
    presupuesto: null, 
    fecha: '',
    busqueda: '',
    estado: 'todos',
    tipo: 'todos'
  });

  const [vistaActual, setVistaActual] = useState('gantt');
  const [tabActual, setTabActual] = useState('proyecto');

  // ✅ CORREGIDO: Helper functions para manejo de empleados
  const getEmpleadoInfo = (actividad) => {
    // Buscar el empleado en la lista de empleados por su ID
    const empleado = Empleados.find(emp => emp.idEmpleado === actividad.empleadoID);
    
    const nombre = empleado?.nombre || actividad.responsable || null;
    const id = actividad.empleadoID;
    
    return {
      id: id,
      nombre: nombre || (id ? `Empleado ${id}` : 'Sin asignar'),
      iniciales: nombre ? 
        nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
        (id ? id.toString().substring(0, 2) : 'SA'),
      tieneNombre: !!nombre,
      empleado: empleado || null
    };
  };

  const handleFilterChange = field => value => {
    setFiltros(f => ({ ...f, [field]: value }));
  };

  const results = useMemo(() => {
    let arr = Actividades || [];
    
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

  // ✅ CORREGIDO: Estadísticas con verificación de arrays
  const stats = {
    total: (Actividades || []).length,
    enProgreso: (Actividades || []).filter(a => a.estado === 'En progreso').length,
    completadas: (Actividades || []).filter(a => a.estado === 'Completada').length,
    pendientes: (Actividades || []).filter(a => a.estado === 'Sin Iniciar').length
  };

  // Agrupar actividades por proyecto/tipo para el árbol
  const groupedActivities = useMemo(() => {
    const groups = {};
    results.forEach(activity => {
      const group = activity.tipo || 'General';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(activity);
    });
    return groups;
  }, [results]);

  // ✅ CORREGIDO: Calcular rango de fechas usando fechas reales del backend
  const dateRange = useMemo(() => {
    if (results.length === 0) return { start: new Date(), end: new Date() };
    
    // Usar tanto fechas de inicio como de fin reales
    const allDates = [];
    results.forEach(activity => {
      allDates.push(new Date(activity.fechaInicioReal));
      if (activity.fechaFinReal) {
        allDates.push(new Date(activity.fechaFinReal));
      }
      // Si no tiene fecha fin real, usar la proyectada como referencia
      else if (activity.fechaFinProyectada) {
        allDates.push(new Date(activity.fechaFinProyectada));
      }
    });
    
    const startDate = new Date(Math.min(...allDates));
    const endDate = new Date(Math.max(...allDates));
    
    // Agregar buffer de 1 semana al final para actividades en progreso
    const finalEndDate = new Date(endDate);
    finalEndDate.setDate(finalEndDate.getDate() + 7);
    
    return { start: startDate, end: finalEndDate };
  }, [results]);

  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Generar timeline basado en fechas reales
  const generateTimeline = () => {
    const { start, end } = dateRange;
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.max(4, Math.ceil(totalDays / 7));
    
    const timeline = [];
    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const realWeekNumber = getWeekNumber(weekStart);
      
      timeline.push({
        week: `Semana ${realWeekNumber}`,
        weekNumber: realWeekNumber,     
        startDate: weekStart,
        label: weekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
      });
    }
    return timeline;
  };

  // ✅ CORREGIDO: Calcular posición real en el gantt usando fechas del backend
  const getGanttPosition = (activity) => {
    const activityStart = new Date(activity.fechaInicioReal);
    const { start: rangeStart } = dateRange;
    
    // Calcular semana de inicio usando semanas reales
    const activityWeekNumber = getWeekNumber(activityStart);
    const rangeStartWeekNumber = getWeekNumber(rangeStart);
    const startWeek = Math.max(0, activityWeekNumber - rangeStartWeekNumber);
    
    // Determinar fecha de fin real
    let activityEnd;
    if (activity.estado === 'Completada' && activity.fechaFinReal) {
      activityEnd = new Date(activity.fechaFinReal);
    } else if (activity.fechaFinProyectada) {
      activityEnd = new Date(activity.fechaFinProyectada);
    } else {
      // Estimar duración por defecto
      activityEnd = new Date(activityStart);
      activityEnd.setDate(activityStart.getDate() + 21); // 3 semanas
    }
    
    // Calcular duración en días y convertir a semanas
    const durationDays = Math.max(1, Math.ceil((activityEnd - activityStart) / (24 * 60 * 60 * 1000)));
    const duration = Math.max(1, Math.ceil(durationDays / 7));
    
    // Calcular progreso real basado en tiempo transcurrido
    const currentDate = new Date();
    const totalDays = Math.max(1, (activityEnd - activityStart) / (24 * 60 * 60 * 1000));
    const daysPassed = Math.max(0, (currentDate - activityStart) / (24 * 60 * 60 * 1000));
    
    let calculatedProgress;
    if (activity.estado === 'Completada') {
      calculatedProgress = 100;
    } else if (activity.estado === 'Sin Iniciar') {
      calculatedProgress = 0;
    } else {
      calculatedProgress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    }
    
    return {
      startWeek,
      duration,
      progress: Math.round(calculatedProgress),
      startDate: activityStart,
      endDate: activityEnd,
      estimatedEndDate: activityEnd,
      realWeekNumber: activityWeekNumber,
      durationDays,
      isOverdue: activity.estado !== 'Completada' && currentDate > activityEnd
    };
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Completada': return '#059669';
      case 'En progreso': return '#f59e0b';
      case 'Sin Iniciar': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'Completada': return <CheckCircle size={16} />;
      case 'En progreso': return <Clock size={16} />;
      case 'Sin Iniciar': return <Pause size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'Completada': return 'status-badge--completada';
      case 'En progreso': return 'status-badge--en-progreso';
      case 'Sin Iniciar': return 'status-badge--pendiente';
      default: return 'status-badge--default';
    }
  };

  const iconMap = {
    'Topografía': <Ruler className="w-5 h-5" />,
    'Movimiento de tierras': <Truck className="w-5 h-5" />,
    'Preparación': <Truck className="w-5 h-5" />,
    'Cimentación': <Building2 className="w-5 h-5" />,
    'Estructura': <Building2 className="w-5 h-5" />,
    'Acabados': <Paintbrush className="w-5 h-5" />,
  };

  const getTipoIcon = (descripcion) => {
    for (const key in iconMap) {
      if (descripcion.includes(key)) {
        return iconMap[key];
      }
    }
    return <Wrench className="w-5 h-5" />; // default
  };

  // ✅ AGREGADO: Función para obtener información del estado mejorada
  const getEstadoInfo = (activity) => {
    const ganttPos = getGanttPosition(activity);
    let displayStatus = activity.estado;
    let statusColor = getEstadoColor(activity.estado);
    
    // Ajustar estado visual si está atrasada
    if (ganttPos.isOverdue && activity.estado !== 'Completada') {
      displayStatus = `${activity.estado} (Atrasada)`;
      statusColor = '#dc2626'; // Rojo para atrasadas
    }
    
    return {
      displayStatus,
      statusColor,
      realProgress: ganttPos.progress,
      isOverdue: ganttPos.isOverdue
    };
  };

  // Función para sincronizar scroll
  const syncScroll = (source, target) => {
    if (source.current && target.current) {
      target.current.scrollLeft = source.current.scrollLeft;
    }
  };

  // useEffect para configurar los event listeners de scroll sincronizado
  useEffect(() => {
    const headerElement = timelineHeaderRef.current?.querySelector('.gantt-timeline-weeks');
    const contentElement = timelineContentRef.current;
    
    if (headerElement && contentElement) {
      const handleHeaderScroll = () => syncScroll({ current: headerElement }, { current: contentElement });
      const handleContentScroll = () => syncScroll({ current: contentElement }, { current: headerElement });
      
      headerElement.addEventListener('scroll', handleHeaderScroll);
      contentElement.addEventListener('scroll', handleContentScroll);
      
      return () => {
        headerElement.removeEventListener('scroll', handleHeaderScroll);
        contentElement.removeEventListener('scroll', handleContentScroll);
      };
    }
  }, [results]);

  // ✅ CORREGIDO: Manejo de estados de carga
  if (loadingActividades || loadingEmpleados) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando actividades y empleados...</p>
      </div>
    );
  }

  if (errorActividades || errorEmpleados) {
    return <p className="dashboard-error">{errorActividades || errorEmpleados}</p>;
  }

  // Vista Gantt con datos reales
  if (vistaActual === 'gantt') {
    const timeline = generateTimeline();
    
    return (
      <div className="gantt-page">
        {/* Header Principal */}
        <header className="gantt-header">
          <div className="gantt-header-container">
            <div className="gantt-header-content">
              <div className="gantt-header-left">
                <button 
                  onClick={() => navigate(-1)} 
                  className="gantt-back-btn"
                  title="Volver"
                >
                  <ChevronLeft size={20} />
                </button>
                <h1 className="gantt-title">Cronograma de Actividades</h1>
                <div className="gantt-date-range">
                  {dateRange.start.toLocaleDateString('es-ES')} - {dateRange.end.toLocaleDateString('es-ES')}
                </div>
              </div>
              
              <div className="gantt-header-actions">
                {/* Tabs */}
                <div className="gantt-tabs">
                  <button
                    onClick={() => setTabActual('proyecto')}
                    className={`gantt-tab ${tabActual === 'proyecto' ? 'gantt-tab--active' : ''}`}
                  >
                    Por proyecto
                  </button>
                  <button
                    onClick={() => setTabActual('todas')}
                    className={`gantt-tab ${tabActual === 'todas' ? 'gantt-tab--active' : ''}`}
                  >
                    Todas
                  </button>
                </div>

                {/* Filtros */}
                <select
                  value={filtros.presupuesto?.value || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('presupuesto')(value ? { value, label: value } : null);
                  }}
                  className="gantt-filter-select"
                >
                  <option value="">Proyecto: Selecciona</option>
                  {[...new Set((Actividades || []).map(a => a.descripcion))].map(desc => (
                    <option key={desc} value={desc}>{desc}</option>
                  ))}
                </select>

                <select
                  value={filtros.estado}
                  onChange={e => handleFilterChange('estado')(e.target.value)}
                  className="gantt-filter-select"
                >
                  <option value="todos">Estado</option>
                  <option value="Completada">Completada</option>
                  <option value="En progreso">En Progreso</option>
                  <option value="Sin Iniciar">Pendiente</option>
                </select>

                <Link to="nueva" className="gantt-btn-add">
                  <Plus size={18} />
                  Nueva
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Estadísticas resumidas */}
        <div className="gantt-stats">
          <div className="gantt-stat">
            <span className="gantt-stat-number">{results.length}</span>
            <span className="gantt-stat-label">Actividades</span>
          </div>
          <div className="gantt-stat">
            <span className="gantt-stat-number">{stats.completadas}</span>
            <span className="gantt-stat-label">Completadas</span>
          </div>
          <div className="gantt-stat">
            <span className="gantt-stat-number">{stats.enProgreso}</span>
            <span className="gantt-stat-label">En Progreso</span>
          </div>
          <div className="gantt-stat">
            <span className="gantt-stat-number">{stats.pendientes}</span>
            <span className="gantt-stat-label">Pendientes</span>
          </div>
        </div>

        {/* Contenido principal - Vista Gantt */}
        <div className="gantt-container">
          {/* Panel izquierdo - Estructura de actividades */}
          <div className="gantt-left-panel">
            <div className="gantt-structure-header">
              <h2 className="gantt-structure-title">Actividades del Proyecto</h2>
              <div className="gantt-structure-info">
                <div className="gantt-structure-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: '#059669'}}></div>
                    <span>Completada</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
                    <span>En Progreso</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{backgroundColor: '#dc2626'}}></div>
                    <span>Pendiente</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="gantt-structure-content">
              {Object.entries(groupedActivities).map(([grupo, actividades]) => (
                <div key={grupo} className="gantt-group">
                  <div className="gantt-group-header">
                    <div className="gantt-group-info">
                      <span className="gantt-group-icon">{getTipoIcon(grupo)}</span>
                      <span className="gantt-group-name">{grupo}</span>
                    </div>
                    <div className="gantt-group-stats">
                      <span className="gantt-group-count">
                        {actividades.length} actividad{actividades.length !== 1 ? 'es' : ''}
                      </span>
                      <div className="gantt-group-progress">
                        {Math.round(actividades.reduce((sum, a) => sum + (getGanttPosition(a).progress || 0), 0) / actividades.length)}% promedio
                      </div>
                    </div>
                  </div>

                  {actividades
                    .sort((a, b) => new Date(a.fechaInicioReal) - new Date(b.fechaInicioReal))
                    .map((actividad) => {
                      const empleadoInfo = getEmpleadoInfo(actividad);
                      return (
                        <NavLink
                          key={actividad.idActividad}
                          to={`${actividad.idActividad}`}
                          className="gantt-activity-item"
                        >
                          <div className="gantt-activity-content">
                            <div className="gantt-activity-info">
                              <div 
                                className="gantt-activity-status"
                                style={{ backgroundColor: getEstadoInfo(actividad).statusColor }}
                              ></div>
                              <div className="gantt-activity-details">
                                <span className="gantt-activity-name">
                                  {actividad.descripcion.length > 30 
                                    ? `${actividad.descripcion.substring(0, 30)}...` 
                                    : actividad.descripcion}
                                </span>
                                <div className="gantt-activity-meta">
                                  <span className="gantt-activity-responsible">
                                    <Users size={14} /> {empleadoInfo.nombre}
                                  </span>
                                  <span className="gantt-activity-progress">
                                    {getGanttPosition(actividad).progress}% completado
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="gantt-activity-dates">
                              <div className="gantt-activity-start-date">
                                {new Date(actividad.fechaInicioReal).toLocaleDateString('es-ES', { 
                                  day: '2-digit', 
                                  month: 'short' 
                                })}
                              </div>
                              {getGanttPosition(actividad).estimatedEndDate && (
                                <div className="gantt-activity-end-date">
                                  {getGanttPosition(actividad).estimatedEndDate.toLocaleDateString('es-ES', { 
                                    day: '2-digit', 
                                    month: 'short' 
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </NavLink>
                      );
                    })}
                </div>
              ))}

              {results.length === 0 && (
                <div className="gantt-no-results">
                  <Activity size={48} className="gantt-no-results-icon" />
                  <h3>No hay actividades para mostrar</h3>
                  <p>Ajusta los filtros o agrega nuevas actividades al proyecto.</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Timeline Gantt */}
          <div className="gantt-right-panel">
            <div className="gantt-timeline-header" ref={timelineHeaderRef}>
              <div className="gantt-timeline-activity-column">
                <div className="timeline-column-title">Actividad</div>
                <div className="timeline-column-subtitle">Responsable</div>
              </div>
              <div className="gantt-timeline-weeks">
                {timeline.map(week => (
                  <div key={week.week} className="gantt-timeline-week">
                    <div className="week-number">{week.week}</div>
                    <div className="week-date">{week.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gantt-timeline-content" ref={timelineContentRef}>
              {Object.entries(groupedActivities).map(([grupo, actividades]) => (
                <div key={grupo} className="gantt-timeline-group">
                  <div className="gantt-timeline-group-separator">
                    <div className="gantt-timeline-group-name">
                      <span className="gantt-timeline-group-icon">{getTipoIcon(grupo)}</span>
                      <span className="group-name">{grupo}</span>
                      <span className="group-summary">
                        {actividades.length} actividad{actividades.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="gantt-timeline-group-grid">
                      {timeline.map((week, index) => (
                        <div key={week.week} className="timeline-grid-cell"></div>
                      ))}
                    </div>
                  </div>

                  {actividades
                    .sort((a, b) => new Date(a.fechaInicioReal) - new Date(b.fechaInicioReal))
                    .map((actividad) => {
                    const ganttPos = getGanttPosition(actividad);
                    const estadoInfo = getEstadoInfo(actividad);
                    const empleadoInfo = getEmpleadoInfo(actividad);
                    
                    return (
                      <div key={actividad.idActividad} className="gantt-timeline-row">
                        <div className="gantt-timeline-activity-info">
                          <div className="gantt-timeline-activity-name">
                            {actividad.descripcion.length > 25 
                              ? `${actividad.descripcion.substring(0, 25)}...` 
                              : actividad.descripcion}
                          </div>
                          <div className="gantt-timeline-activity-responsible">
                            <Users size={12} /> {empleadoInfo.nombre}
                          </div>
                          <div className="gantt-timeline-activity-progress-mini">
                            {ganttPos.progress}%
                          </div>
                        </div>

                        <div className="gantt-timeline-grid">
                          {timeline.map((week, weekIndex) => {
                            const isInRange = weekIndex >= ganttPos.startWeek && 
                                           weekIndex < ganttPos.startWeek + ganttPos.duration;
                            const isStart = weekIndex === ganttPos.startWeek;
                            const isEnd = weekIndex === ganttPos.startWeek + ganttPos.duration - 1;
                            
                            return (
                              <div key={week.week} className="gantt-timeline-cell">
                                {isInRange && (
                                  <div 
                                    className={`gantt-bar ${isStart ? 'gantt-bar-start' : ''} ${isEnd ? 'gantt-bar-end' : ''} ${estadoInfo.isOverdue ? 'gantt-bar-overdue' : ''}`}
                                    style={{ backgroundColor: estadoInfo.statusColor }}
                                    title={`${actividad.descripcion} - ${ganttPos.progress}% completado - ${estadoInfo.displayStatus} - Responsable: ${empleadoInfo.nombre}`}
                                  >
                                    {isStart && (
                                      <div className="gantt-bar-info">
                                        <div className="gantt-bar-dates">
                                          <span className="start-date">
                                            {ganttPos.startDate.toLocaleDateString('es-ES', { 
                                              day: '2-digit', 
                                              month: '2-digit' 
                                            })}
                                          </span>
                                          {ganttPos.estimatedEndDate && (
                                            <span className="end-date">
                                              {ganttPos.estimatedEndDate.toLocaleDateString('es-ES', { 
                                                day: '2-digit', 
                                                month: '2-digit' 
                                              })}
                                            </span>
                                          )}
                                        </div>
                                        
                                        <div className="gantt-bar-progress">
                                          <div 
                                            className="gantt-bar-progress-fill"
                                            style={{ width: `${ganttPos.progress}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {isEnd && (
                                      <div className="gantt-bar-avatar">
                                        {empleadoInfo.iniciales}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón para cambiar vista */}
        <button
          onClick={() => setVistaActual('tarjetas')}
          className="gantt-view-toggle"
          title="Cambiar a vista de tarjetas"
        >
          <Activity size={20} />
        </button>
      </div>
    );
  }

  // Vista original (tarjetas/lista) - código existente simplificado
  return (
    <div className="actividades-page">
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
              <button 
                onClick={() => setVistaActual('gantt')}
                className="view-toggle-btn"
                title="Vista Gantt"
              >
                <Calendar size={18} />
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
              <div className="stat-icon stat-icon--yellow">
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
              <div className="stat-icon stat-icon--red">
                <Pause size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">{stats.pendientes}</div>
                <div className="stat-label">PENDIENTES</div>
              </div>
            </div>
          </div>
        </div>
        
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
            
            {/* Filtros adicionales */}
            <div className="filters-row">
              <select
                value={filtros.estado}
                onChange={e => handleFilterChange('estado')(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos los estados</option>
                <option value="Completada">Completada</option>
                <option value="En progreso">En Progreso</option>
                <option value="Sin Iniciar">Pendiente</option>
              </select>


              {(filtros.busqueda || filtros.estado !== 'todos' || filtros.tipo !== 'todos' || filtros.presupuesto) && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid de actividades */}
        <div className="activities-grid">
          {results.length > 0 ? (
            results.map(actividad => {
              const empleadoInfo = getEmpleadoInfo(actividad);
              const ganttPos = getGanttPosition(actividad);
              
              return (
                <NavLink key={actividad.idActividad} to={`${actividad.idActividad}`} className="activity-card-modern">
                  <div className="activity-card-content">
                    <div className="activity-card-header">
                      <h3 className="activity-title">
                        {actividad.descripcion}
                      </h3>
                      <div className={`status-badge ${getEstadoClass(actividad.estado)}`}>
                        {getEstadoIcon(actividad.estado)}
                        <span>{actividad.estado}</span>
                      </div>
                    </div>
                    
                    <div className="activity-details">
                      <div className="activity-detail-row">
                        <span className="detail-label"><Users size={14} /> Responsable:</span>
                        <span className="detail-value" title={`ID: ${actividad.empleadoID || 'Sin asignar'}`}>
                          {empleadoInfo.nombre}
                        </span>
                      </div>
                      
                      <div className="activity-detail-row">
                        <span className="detail-label"><Calendar size={14} /> Inicio:</span>
                        <span className="detail-value">
                          {new Date(actividad.fechaInicioReal).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      
                      {actividad.fechaFinProyectada && (
                        <div className="activity-detail-row">
                          <span className="detail-label"><Clock size={14} /> Fin proyectado:</span>
                          <span className="detail-value">
                            {new Date(actividad.fechaFinProyectada).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      )}
                      
                      <div className="activity-detail-row">
                        <span className="detail-label"><Activity size={14} /> Progreso:</span>
                        <span className="detail-value">
                          {ganttPos.progress}%
                        </span>
                      </div>
                      
                      {actividad.tipo && (
                        <div className="activity-detail-row">
                          <span className="detail-label"><Filter size={14} /> Tipo:</span>
                          <span className="detail-value">{actividad.tipo}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Barra de progreso visual */}
                    <div className="activity-progress-bar">
                      <div 
                        className="activity-progress-fill"
                        style={{ 
                          width: `${ganttPos.progress}%`,
                          backgroundColor: getEstadoColor(actividad.estado)
                        }}
                      ></div>
                    </div>
                    
                    {/* Indicador de empleado */}
                    <div className="activity-employee-badge">
                      <div className="employee-avatar">
                        {empleadoInfo.iniciales}
                      </div>
                      <span className="employee-name-mini">
                        {empleadoInfo.tieneNombre ? empleadoInfo.nombre.split(' ')[0] : empleadoInfo.nombre}
                      </span>
                    </div>
                  </div>
                </NavLink>
              );
            })
          ) : (
            <div className="no-results-modern">
              <Activity size={48} className="no-results-icon" />
              <h3>No se encontraron actividades</h3>
              <p>
                {filtros.busqueda || filtros.estado !== 'todos' || filtros.tipo !== 'todos' || filtros.presupuesto
                  ? 'Intenta ajustar los filtros o búsqueda.'
                  : 'Aún no hay actividades registradas en el sistema.'
                }
              </p>
              <div className="no-results-actions">
                <Link to="nueva" className="no-results-btn">
                  <Plus size={18} />
                  Nueva actividad
                </Link>
                {(filtros.busqueda || filtros.estado !== 'todos' || filtros.tipo !== 'todos' || filtros.presupuesto) && (
                  <button onClick={clearFilters} className="no-results-btn-secondary">
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {Empleados && Empleados.length > 0 && (
          <div className="empleados-info">
            <p className="empleados-count">
              <CheckCircle size={16} /> {Empleados.length} empleado{Empleados.length !== 1 ? 's' : ''} disponible{Empleados.length !== 1 ? 's' : ''} en el sistema
            </p>
          </div>
        )}
      </div>
    </div>
  );
}