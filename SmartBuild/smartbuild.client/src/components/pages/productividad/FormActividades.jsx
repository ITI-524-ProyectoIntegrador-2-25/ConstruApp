// src/components/pages/productividad/FormActividades.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Select from 'react-select';
import '../../../styles/Dashboard.css';
import './FormActividad.css';

// Hook
import { useInsertarActualizarActividades } from '../../../hooks/Actividades';

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com';

export default function FormActividades() {
  const navigate = useNavigate();
  const alertRef = useRef(null);

  const [presupuestosOpts, setPresupuestosOpts] = useState([]);
  const [empleadosOpts, setEmpleadosOpts] = useState([]);
  const [form, setForm] = useState({
    presupuesto: null,
    empleado: null,
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    estado: ''
  });
  const [error, setError] = useState('');

  const { guardarActividad, loading, error: errorGuardar} = useInsertarActualizarActividades();

  useEffect(() => {
    const usr = localStorage.getItem('currentUser');
    if (!usr) return;
    const { correo, usuario } = JSON.parse(usr);
    const usuarioParam = encodeURIComponent(correo || usuario);

    Promise.all([
      fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${usuarioParam}`).then(res => res.json()),
      fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${usuarioParam}`).then(res => res.json())
    ])
      .then(([presData, empData]) => {
        setPresupuestosOpts(
          presData.map(p => ({ value: p.idPresupuesto, label: p.descripcion }))
        );
        setEmpleadosOpts(
          empData.map(emp => ({
            value: emp.idEmpleado,
            label: emp.nombreEmpleado || `${emp.nombre || ''} ${emp.apellido || ''}`.trim()
          }))
        );
      })
      .catch(err => console.error('Error cargando opciones:', err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const handleSelect = field => selected => {
    setForm(f => ({ ...f, [field]: selected }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const { presupuesto, empleado, fechaInicio, fechaFin, descripcion, estado } = form;

    if (!presupuesto || !empleado || !fechaInicio || !fechaFin || !descripcion.trim() || !estado.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    try {
      const usr = localStorage.getItem('currentUser');
      if (!usr) throw new Error('Usuario no autenticado');
      const { correo, usuario } = JSON.parse(usr);
      const correoUser = correo || usuario;

      const payload = {
        usuario: correoUser,
        presupuestoID: presupuesto.value,
        empleadoID: empleado.value,
        descripcion,
        fechaInicioProyectada: fechaInicio,
        fechaFinProyectada: fechaFin,
        fechaInicioReal: fechaInicio,
        fechaFinReal: fechaFin,
        estado
      };

      const ok = await guardarActividad(payload);
      if (!ok) throw new Error(errorGuardar || 'No se pudo guardar la actividad');

      navigate(-1);
    } catch (err) {
      console.error('Error creando actividad:', err);
      setError(err.message || 'No se pudo guardar la actividad');
    }
  };

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar">
          <ChevronLeft size={20} />
        </button>
        <h1>Nueva Actividad</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        <div className="form-group">
          <label>Presupuesto asociado</label>
          <Select
            name="presupuesto"
            options={presupuestosOpts}
            value={form.presupuesto}
            onChange={handleSelect('presupuesto')}
            placeholder="Seleccionar presupuesto…"
            className="react-select-container"
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            menuPosition="absolute"
            menuPlacement="auto"
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999
              })
            }}
          />
        </div>

        <div className="form-group">
          <label>Empleado asignado</label>
          <Select
            name="empleado"
            options={empleadosOpts}
            value={form.empleado}
            onChange={handleSelect('empleado')}
            placeholder="Seleccionar empleado…"
            className="react-select-container"
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
            menuPlacement="auto"
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999
              })
            }}
          />
        </div> 


        <div className="form-group">
          <label>Fecha y hora de inicio</label>
          <input
            name="fechaInicio"
            type="datetime-local"
            value={form.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha y hora de fin</label>
          <input
            name="fechaFin"
            type="datetime-local"
            value={form.fechaFin}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Estado</label>
          <input
            name="estado"
            type="text"
            value={form.estado}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar actividad'}
        </button>
      </form>
    </div>
  );
}
