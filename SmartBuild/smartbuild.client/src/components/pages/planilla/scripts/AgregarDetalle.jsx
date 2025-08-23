// src/components/pages/planilla/AgregarDetalle.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar, User, Building2, Clock } from 'lucide-react';
import Select from 'react-select';
import '../css/Planilla.css';
import { dateOnly, isHalfStep } from '../../../../utils/date';

// Hooks
import { usePlanillas, usePlanillaDetalles, useInsertarPlanillaDetalle } from '../../../../hooks/Planilla';
import { useEmpleados } from '../../../../hooks/Empleados';
import { usePresupuestos } from '../../../../hooks/dashboard';

// ===== utils =====
function isActiveFlag(v) {
  const s = String(v).toLowerCase();
  return v === 1 || v === true || s === '1' || s === 'true';
}

export default function AgregarDetalle() {
  const { idPlanilla } = useParams();
  const navigate = useNavigate();

  // Planilla para el rango
  const { Planillas } = usePlanillas();
  const planillaActual = useMemo(
    () =>
      Array.isArray(Planillas)
        ? Planillas.find(p => String(p.idPlanilla) === String(idPlanilla))
        : null,
    [Planillas, idPlanilla]
  );

  const rangoPlanilla = useMemo(() => {
    if (!planillaActual) return { ini: '', fin: '' };
    return {
      ini: dateOnly(planillaActual.fechaInicio || planillaActual.FechaInicio),
      fin: dateOnly(planillaActual.fechaFin || planillaActual.FechaFin),
    };
  }, [planillaActual]);

  // Listados
  const { Empleados } = useEmpleados();
  const { presupuestos: Presupuestos } = usePresupuestos();
  const { Detalles } = usePlanillaDetalles(); // todas las planillas (para validar duplicados globales)

  // ===== opciones de selects =====
  const projectsOpts = useMemo(() => {
    const list = Array.isArray(Presupuestos) ? Presupuestos : [];
    return list.map(p => ({
      value: p.idPresupuesto,
      label: p.descripcion || `Proyecto ${p.idPresupuesto}`,
    }));
  }, [Presupuestos]);

  const employeesOpts = useMemo(() => {
    const list = Array.isArray(Empleados) ? Empleados : [];
    return list
      .filter(e => isActiveFlag(e.activo)) // 👈 solo activos para planilla
      .map(e => ({
        value: e.idEmpleado,
        label:
          e.nombreEmpleado ||
          `${e.nombre || ''} ${e.apellido || ''}`.trim() ||
          `Empleado ${e.idEmpleado}`,
        salarioHora: e.salarioHora ?? null,
      }));
  }, [Empleados]);

  // ===== índice duplicados global (empleado + fecha) =====
  const detallesIndex = useMemo(() => {
    const idx = new Set();
    const all = Array.isArray(Detalles) ? Detalles : [];
    for (const d of all) {
      const empId = Number(d.empleadoID ?? d.EmpleadoID);
      const fecha = dateOnly(d.fecha || d.Fecha);
      if (empId && fecha) idx.add(`${empId}|${fecha}`);
    }
    return idx;
  }, [Detalles]);

  // ===== form =====
  const [form, setForm] = useState({
    proyecto: null,
    empleado: null,
    fecha: '',
    salarioHora: '',
    horasOrdinarias: '',
    horasExtras: '',
    horasDobles: '',
  });

  // si el empleado seleccionado deja de estar en el listado (p.e., desactivado), limpiamos el campo
  useEffect(() => {
    if (!form.empleado) return;
    if (!employeesOpts.some(o => o.value === form.empleado.value)) {
      setForm(f => ({ ...f, empleado: null, salarioHora: '' }));
    }
  }, [employeesOpts]); // eslint-disable-line react-hooks/exhaustive-deps

  // totales
  const so = Number(form.horasOrdinarias || 0);
  const se = Number(form.horasExtras || 0);
  const sd = Number(form.horasDobles || 0);
  const sh = Number(form.salarioHora || 0);
  const total = useMemo(() => sh * so + sh * 1.5 * se + sh * 2 * sd, [sh, so, se, sd]);

  // handlers
  const [error, setError] = useState('');
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };
  const handleSelectChange = (name, val) => {
    if (name === 'empleado') {
      setForm(f => ({
        ...f,
        empleado: val,
        salarioHora: val?.salarioHora != null ? String(val.salarioHora) : '',
      }));
    } else {
      setForm(f => ({ ...f, [name]: val }));
    }
    setError('');
  };

  // guardar
  const { insertarPlanillaDetalle, loading: sending, error: saveError } = useInsertarPlanillaDetalle();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.proyecto || !form.empleado || !form.fecha) {
      setError('Proyecto, empleado y fecha son obligatorios');
      return;
    }

    // Por si el hook trae empleados inactivos: validación final
    const empRaw = (Empleados || []).find(e => e.idEmpleado === form.empleado.value);
    if (!isActiveFlag(empRaw?.activo)) {
      setError('El empleado está inactivo y no puede registrar horas.');
      return;
    }

    const dStr = dateOnly(form.fecha);
    const dNum = Date.parse(dStr);
    const iniNum = Date.parse(rangoPlanilla.ini);
    const finNum = Date.parse(rangoPlanilla.fin);

    if (Number.isFinite(iniNum) && dNum < iniNum) {
      setError(`La fecha no puede ser anterior al inicio de la planilla (${rangoPlanilla.ini})`);
      return;
    }
    if (Number.isFinite(finNum) && dNum > finNum) {
      setError(`La fecha no puede ser posterior al fin de la planilla (${rangoPlanilla.fin})`);
      return;
    }

    if ([so, se, sd].some(v => v < 0) || Number(form.salarioHora) <= 0) {
      setError('Horas y salario deben ser ≥ 0; el salario mayor a 0');
      return;
    }
    if (!isHalfStep(so) || !isHalfStep(se) || !isHalfStep(sd)) {
      setError('Las horas deben ingresarse en incrementos de 0.5');
      return;
    }
    if (so + se + sd < 0.5) {
      setError('Debe registrar al menos 0.5 hora en alguna categoría');
      return;
    }
    if (so + se + sd > 24) {
      setError('La suma de horas no puede superar 24 en un día');
      return;
    }

    // duplicado global
    const key = `${form.empleado.value}|${dStr}`;
    if (detallesIndex.has(key)) {
      setError('Ese empleado ya tiene un registro en esa fecha (en alguna planilla).');
      return;
    }

    const ts = new Date().toISOString();
    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem('currentUser') || '{}'); } catch { return {}; }
    })();

    const payload = {
      usuario: currentUser.correo || currentUser.usuario || '',
      quienIngreso: undefined,
      cuandoIngreso: ts,
      quienModifico: undefined,
      cuandoModifico: ts,

      planillaID: Number(idPlanilla),
      empleadoID: form.empleado.value,
      presupuestoID: form.proyecto.value,
      fecha: form.fecha && form.fecha.length === 10
        ? `${form.fecha}T00:00:00.000Z`
        : new Date(form.fecha).toISOString(),
      salarioHora: Number(Number(form.salarioHora).toFixed(2)),
      horasOrdinarias: so,
      horasExtras: se,
      horasDobles: sd,
      detalle: 'Agregado desde formulario',
    };

    const ok = await insertarPlanillaDetalle(payload);
    if (ok) navigate(`/dashboard/planilla/${idPlanilla}`);
    else setError(saveError || 'Error al agregar detalle');
  };

  // estilos consistentes del react-select (sin depender de CSS externo)
  const rsStyles = {
    container: base => ({ ...base, width: '100%', margin: 0 }),
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      borderRadius: 12,
      backgroundColor: '#fff',
      borderColor: state.isFocused ? '#667eea' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(102,126,234,.12)' : 'none',
      '&:hover': { borderColor: state.isFocused ? '#667eea' : '#d1d5db' },
    }),
    valueContainer: base => ({ ...base, padding: '2px 10px' }),
    indicatorsContainer: base => ({ ...base, paddingRight: 8 }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    menu: base => ({ ...base, zIndex: 9999, borderRadius: 12, overflow: 'hidden' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#eef2ff' : '#fff',
      color: state.isSelected ? '#fff' : '#111827',
    }),
    placeholder: base => ({ ...base, color: '#6b7280' }),
  };

  const empleadoFechaBloqueado =
    form.empleado && form.fecha && detallesIndex.has(`${form.empleado.value}|${dateOnly(form.fecha)}`);

  return (
    <div className="empleados-page-modern form-planilla-modern">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} title="Volver">
            <ChevronLeft size={20} />
          </button>
          <div className="title-section">
            <h1 className="page-title">
              <Plus size={28} /> Agregar registro
            </h1>
            <p className="page-subtitle">Carga un registro de horas dentro del rango de la planilla</p>
          </div>
        </div>
      </div>

      {/* PANEL / FORM */}
      <div className="filters-panel">
        <div className="filters-content">
          <form
            onSubmit={handleSubmit}
            className="form-dashboard"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
          >
            {/* Proyecto y Empleado en la MISMA FILA */}
            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Building2 size={16} /> Proyecto
              </label>
              <Select
                classNamePrefix="rs"
                options={projectsOpts}
                value={form.proyecto}
                onChange={val => handleSelectChange('proyecto', val)}
                placeholder="Seleccionar proyecto…"
                isDisabled={sending}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={rsStyles}
                components={{ IndicatorSeparator: null }}
              />
            </div>

            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <User size={16} /> Empleado
              </label>
              <Select
                classNamePrefix="rs"
                options={employeesOpts}
                value={form.empleado}
                onChange={val => handleSelectChange('empleado', val)}
                placeholder="Seleccionar empleado…"
                isDisabled={sending}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={rsStyles}
                components={{ IndicatorSeparator: null }}
              />
            </div>

            {/* FECHA y SALARIO (misma fila) */}
            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Calendar size={16} />
                Fecha{' '}
                {rangoPlanilla.ini && rangoPlanilla.fin
                  ? `(${rangoPlanilla.ini} → ${rangoPlanilla.fin})`
                  : ''}
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                disabled={sending}
                min={rangoPlanilla.ini || undefined}
                max={rangoPlanilla.fin || undefined}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label">Salario por hora</label>
              <input
                type="number"
                name="salarioHora"
                value={form.salarioHora}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                disabled // no editable, viene del empleado
                className="modern-input"
              />
              <small className="hint">Se toma automáticamente del empleado seleccionado.</small>
            </div>

            {/* HORAS */}
            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Clock size={16} /> Horas ordinarias
              </label>
              <input
                type="number"
                name="horasOrdinarias"
                value={form.horasOrdinarias}
                onChange={handleChange}
                min="0"
                step="0.5"
                disabled={sending}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Clock size={16} /> Horas extras
              </label>
              <input
                type="number"
                name="horasExtras"
                value={form.horasExtras}
                onChange={handleChange}
                min="0"
                step="0.5"
                disabled={sending}
                className="modern-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label d-flex align-items-center gap-2">
                <Clock size={16} /> Horas dobles
              </label>
              <input
                type="number"
                name="horasDobles"
                value={form.horasDobles}
                onChange={handleChange}
                min="0"
                step="0.5"
                disabled={sending}
                className="modern-input"
              />
            </div>

            {/* RESUMEN */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Resumen</label>
              <div className="value" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>Ordinarias: <strong>{so || 0}</strong></span>
                <span>Extras: <strong>{se || 0}</strong></span>
                <span>Dobles: <strong>{sd || 0}</strong></span>
                <span>Total ₡: <strong>{Number.isFinite(total) ? total.toFixed(2) : '0.00'}</strong></span>
              </div>
            </div>

            {(empleadoFechaBloqueado || error) && (
              <div className="alert alert-danger" style={{ gridColumn: '1 / -1' }}>
                {empleadoFechaBloqueado
                  ? 'Ese empleado ya tiene un registro en esa fecha (en alguna planilla).'
                  : error}
              </div>
            )}

            {/* BOTONES */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '.75rem' }}>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary-modern" disabled={sending}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary-modern" disabled={sending || empleadoFechaBloqueado}>
                {sending ? 'Agregando…' : 'Agregar registro'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><Clock size={18} /></div>
          <div className="stat-content">
            <span className="stat-number">{(so + se + sd) || 0}</span>
            <span className="stat-label">Horas totales</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={18} /></div>
          <div className="stat-content">
            <span className="stat-number">
              {rangoPlanilla.ini ? `${rangoPlanilla.ini} → ${rangoPlanilla.fin}` : '—'}
            </span>
            <span className="stat-label">Rango planilla</span>
          </div>
        </div>
      </div>
    </div>
  );
}