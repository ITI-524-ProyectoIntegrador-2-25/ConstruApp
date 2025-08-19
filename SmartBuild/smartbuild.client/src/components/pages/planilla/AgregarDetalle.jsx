// src/components/pages/planilla/AgregarDetalle.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar, User, Building2, Clock } from 'lucide-react';
import Select from 'react-select';
import './css/Planilla.css';

// 🔧 Hooks (sube 3 niveles hasta src/hooks)
import { usePlanillas, usePlanillaDetalles, useInsertarPlanillaDetalle } from '../../../hooks/Planilla';
import { useEmpleados } from '../../../hooks/Empleados';
import { usePresupuestos } from '../../../hooks/dashboard';

/* =========================
   Helpers
   ========================= */
function dateOnly(v) {
  if (!v) return '';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}
function isHalfStep(n) {
  return Number.isFinite(n) && Math.round(n * 2) === n * 2;
}
function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function AgregarDetalle() {
  const { idPlanilla } = useParams();
  const navigate = useNavigate();

  // ✅ Planillas para obtener rango
  const { Planillas } = usePlanillas();
  const planillaActual = useMemo(
    () =>
      Array.isArray(Planillas)
        ? Planillas.find(p => String(p.idPlanilla) === String(idPlanilla))
        : null,
    [Planillas, idPlanilla]
  );

  // ✅ Rango de fechas de la planilla
  const rangoPlanilla = useMemo(() => {
    if (!planillaActual) return { ini: '', fin: '' };
    return {
      ini: dateOnly(planillaActual.fechaInicio || planillaActual.FechaInicio),
      fin: dateOnly(planillaActual.fechaFin || planillaActual.FechaFin),
    };
  }, [planillaActual]);

  // ✅ Listados (hooks)
  const { Empleados } = useEmpleados();
  const { presupuestos: Presupuestos } = usePresupuestos();
  // ⚠️ Trae TODOS los detalles (global) para validar duplicados por empleado+fecha
  const { Detalles } = usePlanillaDetalles();

  // ✅ Opciones para selects
  const employeesOpts = useMemo(() => {
    const list = Array.isArray(Empleados) ? Empleados : [];
    return list.map(e => ({
      value: e.idEmpleado,
      label:
        e.nombreEmpleado ||
        `${e.nombre || ''} ${e.apellido || ''}`.trim() ||
        `Empleado ${e.idEmpleado}`,
    }));
  }, [Empleados]);

  const projectsOpts = useMemo(() => {
    const list = Array.isArray(Presupuestos) ? Presupuestos : [];
    return list.map(p => ({
      value: p.idPresupuesto,
      label: p.descripcion || `Proyecto ${p.idPresupuesto}`,
    }));
  }, [Presupuestos]);

  // ✅ Índice de bloqueo GLOBAL (empleado + fecha)
  const detallesIndex = useMemo(() => {
    const idx = new Set();
    const all = Array.isArray(Detalles) ? Detalles : [];
    for (const d of all) {
      const empId = d.empleadoID ?? d.EmpleadoID;
      const fecha = dateOnly(d.fecha || d.Fecha);
      if (empId != null && fecha) idx.add(`${empId}|${fecha}`);
    }
    return idx;
  }, [Detalles]);

  // ✅ Estado local del formulario
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    proyecto: null,
    empleado: null,
    fecha: '',
    salarioHora: '', // SIEMPRE viene del empleado (solo-lectura)
    horasOrdinarias: '',
    horasExtras: '',
    horasDobles: '',
  });

  // ✅ Guardado vía hook (INSERT separado)
  const {
    insertarPlanillaDetalle,
    loading: sending,
    error: saveError,
  } = useInsertarPlanillaDetalle();

  // ✅ Al seleccionar empleado, tomar su salario automáticamente
  useEffect(() => {
    if (!form.empleado) {
      setForm(f => ({ ...f, salarioHora: '' }));
      return;
    }
    const emp = (Empleados || []).find(e => e.idEmpleado === form.empleado.value);
    const salario = emp?.salarioHora;
    setForm(f => ({
      ...f,
      salarioHora: salario != null && salario !== '' ? String(salario) : '',
    }));
  }, [form.empleado, Empleados]);

  // ✅ Totales live
  const so = toNum(form.horasOrdinarias);
  const se = toNum(form.horasExtras);
  const sd = toNum(form.horasDobles);
  const sh = toNum(form.salarioHora);
  const total = useMemo(() => sh * so + sh * 1.5 * se + sh * 2 * sd, [sh, so, se, sd]);

  // ✅ Handlers
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };
  const handleSelectChange = (name, val) => {
    setForm(f => ({ ...f, [name]: val }));
    setError('');
  };

  // ✅ Submit
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.proyecto || !form.empleado || !form.fecha) {
      setError('Proyecto, empleado y fecha son obligatorios');
      return;
    }

    // Salario del empleado debe existir y ser válido
    if (!Number.isFinite(sh) || sh <= 0) {
      setError('El empleado seleccionado no tiene un salario por hora válido.');
      return;
    }

    // Fechas dentro del rango de la planilla
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

    // Validaciones cuantitativas de horas
    if ([so, se, sd].some(v => v < 0)) {
      setError('Las horas deben ser ≥ 0');
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

    // 🔒 Bloqueo GLOBAL: mismo empleado y misma fecha aunque sea otra planilla
    const key = `${form.empleado.value}|${dStr}`;
    if (detallesIndex.has(key)) {
      setError('Ese empleado ya tiene un registro en esa fecha (en otra planilla).');
      return;
    }

    // Usuario actual
    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem('currentUser') || '{}'); } catch { return {}; }
    })();
    const usuario = currentUser.correo || currentUser.usuario || '';
    if (!usuario) {
      setError('Usuario no autenticado');
      return;
    }

    const ts = new Date().toISOString();
    const payload = {
      usuario,
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
      salarioHora: Number(sh.toFixed(2)),
      horasOrdinarias: so,
      horasExtras: se,
      horasDobles: sd,
      detalle: 'Agregado desde formulario',
    };

    const ok = await insertarPlanillaDetalle(payload);
    if (ok) {
      navigate(`/dashboard/planilla/${idPlanilla}`);
    } else {
      setError(saveError || 'Error al agregar detalle');
    }
  };

  const empleadoFechaBloqueado =
    form.empleado &&
    form.fecha &&
    detallesIndex.has(`${form.empleado.value}|${dateOnly(form.fecha)}`);

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
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="field-label d-flex align-items-center gap-2">
                <Building2 size={16} /> Proyecto
              </label>
              <Select
                classNamePrefix="react-select"
                options={projectsOpts}
                value={form.proyecto}
                onChange={val => handleSelectChange('proyecto', val)}
                placeholder="Seleccionar proyecto…"
                isDisabled={sending}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                menuShouldBlockScroll
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  menu: base => ({ ...base, zIndex: 9999 }),
                  control: base => ({ ...base, minHeight: 44 }),
                  valueContainer: base => ({ ...base, padding: '0 .5rem' })
                }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="field-label d-flex align-items-center gap-2">
                <User size={16} /> Empleado
              </label>
              <Select
                classNamePrefix="react-select"
                options={employeesOpts}
                value={form.empleado}
                onChange={val => handleSelectChange('empleado', val)}
                placeholder="Seleccionar empleado…"
                isDisabled={sending}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                menuShouldBlockScroll
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 }),
                  menu: base => ({ ...base, zIndex: 9999 }),
                  control: base => ({ ...base, minHeight: 44 }),
                  valueContainer: base => ({ ...base, padding: '0 .5rem' })
                }}
              />
            </div>

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
                readOnly
                disabled // 👈 NO editable: siempre viene del empleado
                min="0.01"
                step="0.01"
                className="modern-input"
                title="El salario por hora se toma automáticamente del empleado"
              />
              <small className="hint">Se toma automáticamente del empleado seleccionado.</small>
            </div>

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

            {(empleadoFechaBloqueado || error) && (
              <div className="alert alert-danger" style={{ gridColumn: '1 / -1' }}>
                {empleadoFechaBloqueado
                  ? 'Ese empleado ya tiene un registro en esa fecha (en otra planilla).'
                  : error}
              </div>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '.75rem' }}>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary-modern" disabled={sending}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary-modern"
                disabled={
                  sending ||
                  empleadoFechaBloqueado ||
                  !form.empleado ||
                  !form.proyecto ||
                  !form.fecha ||
                  !Number.isFinite(sh) ||
                  sh <= 0
                }
              >
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
