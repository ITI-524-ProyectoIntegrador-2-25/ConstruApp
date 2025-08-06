import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, Calendar } from 'lucide-react';
import '../../../styles/Dashboard.css';
import './Empleados.css';

// ✅ Importa el hook
import { useEmpleados } from '../../../hooks/Empleados'; // Ajusta la ruta si es diferente

export default function Empleados() {
  const navigate = useNavigate();

  // ✅ Hook en lugar de useEffect + fetch
  const { Empleados, loading, error } = useEmpleados();

  // Filtros y resultados
  const [results, setResults] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroPuesto, setFiltroPuesto] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Aplica filtros cuando cambian
  useEffect(() => {
    let arr = Empleados;

    if (filtroNombre) {
      const q = filtroNombre.toLowerCase();
      arr = arr.filter(e =>
        (`${e.nombre} ${e.apellido}` || '').toLowerCase().includes(q)
      );
    }

    if (filtroPuesto) {
      arr = arr.filter(e =>
        (e.puesto || '').toLowerCase().includes(filtroPuesto.toLowerCase())
      );
    }

    if (filtroFecha) {
      arr = arr.filter(e =>
        new Date(e.fechaIngreso).toISOString().slice(0, 10) === filtroFecha
      );
    }

    setResults(arr);
  }, [Empleados, filtroNombre, filtroPuesto, filtroFecha]);

  if (loading) return <p>Cargando…</p>;
  if (error) return <p className="empleados-error">{error}</p>;

  return (
    <div className="empleados-page">
      <header className="empleados-header">
        <div className="title-group">
          <button className="back-btn" onClick={() => navigate(-1)} title="Volver">
            <ChevronLeft size={20} />
          </button>
          <h1 className="empleados-title">Empleados</h1>
        </div>
      </header>

      <div className="empleados-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar nombre"
            value={filtroNombre}
            onChange={e => setFiltroNombre(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter className="filter-icon" />
          <input
            type="text"
            placeholder="Buscar puesto"
            value={filtroPuesto}
            onChange={e => setFiltroPuesto(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Calendar className="filter-icon" />
          <input
            type="date"
            value={filtroFecha}
            onChange={e => setFiltroFecha(e.target.value)}
          />
        </div>
        <button className="btn-search" onClick={() => {}}>
          Buscar
        </button>
        <Link to="nuevo" className="btn-add">
          + Agregar empleado
        </Link>
      </div>

      <div className="empleados-list">
        {results.length > 0 ? (
          results.map(emp => (
            <NavLink
              key={emp.idEmpleado}
              to={`${emp.idEmpleado}`}
              className="empleado-card"
            >
              <div className="card-imagen">
                <img
                  src={require('../../../assets/img/dashboard.png')}
                  alt={`${emp.nombre} ${emp.apellido}`}
                />
              </div>

              <div className="card-info">
                <h3>{emp.nombre} {emp.apellido}</h3>
                <p>{emp.puesto}</p>
              </div>

              <div className="card-extra">
                <span>
                  <span className="label">Identificación</span>
                  {emp.identificacion}
                </span>
                <span>
                  <span className="label">Salario ₡/h</span>
                  {emp.salarioHora}
                </span>
                <span>
                  <span className="label">Fecha ingreso</span>
                  {new Date(emp.fechaIngreso).toLocaleDateString()}
                </span>
                <span>
                  <span className="label">Estado</span>
                  {emp.activo === "True" ? "Activo" : "Inactivo"}
                </span>
              </div>
            </NavLink>
          ))
        ) : (
          <p className="no-results">No se encontraron empleados</p>
        )}
      </div>

      {Empleados.length > 0 && (
        <div className="results-footer">
          Mostrando {results.length} de {Empleados.length} empleado
          {Empleados.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
