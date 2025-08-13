// src/components/pages/planilla/FormPlanilla.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Calendar, Hash, ClipboardList, Save, AlertTriangle,
  CheckCircle2, XCircle, FileSpreadsheet
} from 'lucide-react';
import '../../../styles/Dashboard.css';
import './Planilla.css';        // ⬅️ Reutilizamos el estilo moderno
import './FormPlanilla.css';               // (opcional) tus retoques locales
import { insertPlanilla, getPlanilla } from '../../../api/Planilla';

const ESTADOS = ['Abierta', 'Revisión', 'Cerrada'];
const RANGO_DIAS = 15;

// ====== Utilidades de fecha (en UTC, robustas) ======
function toYYYYMMDD(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function parseYYYYMMDD(ymd) {
  if (!ymd || typeof ymd !== 'string') return null;
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d, 12)); // 12:00 UTC evita saltos
  return isNaN(dt) ? null : dt;
}
function addDaysYYYYMMDD(ymd, days) {
  const base = parseYYYYMMDD(ymd);
  if (!base) return '';
  base.setUTCDate(base.getUTCDate() + days);
  return toYYYYMMDD(base);
}
function humanRange(ini, fin) {
  if (!ini || !fin) return '';
  try {
    const i = new Date(`${ini}T00:00:00`);
    const f = new Date(`${fin}T00:00:00`);
    const fmt = (dt) =>
      dt.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${fmt(i)} – ${fmt(f)}`;
  } catch {
    return '';
  }
}
const sanitizeName = (s) => (s || '').trim().toLowerCase();

export default function FormPlanilla() {
  const navigate = useNavigate();
  const alertRef = useRef(null);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    estado: ESTADOS[0],
  });
  const [error, setError] = useState('');
  const [allNames, setAllNames] = useState([]);

  // ====== Usuario ======
  const getUsuario = () => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return u.correo || u.usuario || '';
    } catch {
      return '';
    }
  };

  // ====== Nombres existentes ======
  useEffect(() => {
    const usuario = getUsuario();
    if (!usuario) return;
    getPlanilla(usuario)
      .then((list) => {
        const names = Array.isArray(list) ? list.map((p) => sanitizeName(p?.nombre)) : [];
        setAllNames(names.filter(Boolean));
      })
      .catch(() => {});
  }, []);

  // ====== Autocalcular fecha fin (inicio + 15) ======
  useEffect(() => {
    if (form.fechaInicio) {
      const fin = addDaysYYYYMMDD(form.fechaInicio, RANGO_DIAS);
      setForm((f) => ({ ...f, fechaFin: fin }));
    } else {
      setForm((f) => ({ ...f, fechaFin: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fechaInicio]);

  // ====== Validaciones ======
  const nombreSan = sanitizeName(form.nombre);
  const nombreDuplicado = useMemo(
    () => nombreSan && allNames.includes(nombreSan),
    [nombreSan, allNames]
  );
  const nombreCorto = form.nombre.trim().length > 0 && form.nombre.trim().length < 3;
  const nombreMuyLargo = form.nombre.trim().length > 80;

  const fechaIniValida = !!parseYYYYMMDD(form.fechaInicio);
  const fechaFinValida = !!parseYYYYMMDD(form.fechaFin);

  const rangoInvalido =
    fechaIniValida &&
    fechaFinValida &&
    form.fechaFin !== addDaysYYYYMMDD(form.fechaInicio, RANGO_DIAS);

  const disableSubmit =
    sending ||
    !form.nombre.trim() ||
    !fechaIniValida ||
    !fechaFinValida ||
    !ESTADOS.includes(form.estado) ||
    nombreDuplicado ||
    nombreCorto ||
    nombreMuyLargo ||
    rangoInvalido;

  // ====== Handlers ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (disableSubmit) {
      setError('Revisá los datos del formulario.');
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const usuario = getUsuario();
    if (!usuario) {
      setError('Usuario no autenticado');
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const ts = new Date().toISOString();
    const fechaFinAuto = addDaysYYYYMMDD(form.fechaInicio, RANGO_DIAS);

    const payload = {
      usuario,
      quienIngreso: usuario,
      cuandoIngreso: ts,
      quienModifico: usuario,
      cuandoModifico: ts,
      idPlanilla: 0,
      nombre: form.nombre.trim(),
      fechaInicio: new Date(`${form.fechaInicio}T00:00:00`).toISOString(),
      fechaFin: new Date(`${fechaFinAuto}T23:59:59`).toISOString(),
      estado: form.estado,
    };

    try {
      setSending(true);
      await insertPlanilla(payload);
      navigate(-1);
    } catch (err) {
      setError(err.message || 'No se pudo guardar la planilla.');
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setSending(false);
    }
  };

  // ====== Cálculo informativo de días ======
  const diasPeriodo = useMemo(() => {
    if (!fechaIniValida || !fechaFinValida) return null;
    const ini = parseYYYYMMDD(form.fechaInicio);
    const fin = parseYYYYMMDD(form.fechaFin);
    if (!ini || !fin) return null;
    return Math.round((fin - ini) / (1000 * 60 * 60 * 24));
  }, [form.fechaInicio, form.fechaFin, fechaIniValida, fechaFinValida]);

  // ====== UI ======
  return (
    <div className="form-planilla-modern">
      {/* Header moderno */}
      <div className="page-header">
        <div className="header-left">
          <button
            className="btn-back-modern"
            onClick={() => navigate(-1)}
            title="Volver"
            aria-label="Volver"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="title-section">
            <h1 className="page-title">
              <FileSpreadsheet size={28} />
              Nueva Planilla
            </h1>
            <p className="page-subtitle">Define el periodo y estado de la planilla</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="submit"
            form="form-planilla"
            className="btn-primary-modern"
            disabled={disableSubmit}
            title="Guardar planilla"
          >
            <Save size={16} />
            {sending ? 'Guardando…' : 'Guardar planilla'}
          </button>
        </div>
      </div>

      {/* Panel/formulario con estética moderna */}
      <div className="filters-panel" style={{ borderRadius: '0 0 20px 20px' }}>
        <div className="filters-content">
          {error && (
            <div
              ref={alertRef}
              className="alert"
              role="alert"
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: '1rem',
              }}
            >
              <XCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form id="form-planilla" onSubmit={handleSubmit}>
            <div className="filter-row">
              {/* Nombre */}
              <div className="filter-field">
                <label>Nombre</label>
                <div className="input-with-icon">
                  <Hash size={16} className="input-icon" />
                  <input
                    className="modern-input"
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    disabled={sending}
                    maxLength={80}
                    placeholder="Ej. Planilla 1ra quincena agosto"
                    aria-invalid={Boolean(nombreDuplicado || nombreCorto || nombreMuyLargo)}
                  />
                </div>
                <div style={{ display: 'grid', gap: 4 }}>
                  {nombreCorto && (
                    <small className="hint">El nombre debe tener al menos 3 caracteres.</small>
                  )}
                  {nombreMuyLargo && <small className="hint">Máximo 80 caracteres.</small>}
                  {nombreDuplicado && (
                    <small className="hint" style={{ color: '#b91c1c' }}>
                      Ya existe una planilla con este nombre.
                    </small>
                  )}
                </div>
              </div>

              {/* Fecha inicio */}
              <div className="filter-field">
                <label>Fecha inicio</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input
                    className="modern-input"
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    value={form.fechaInicio}
                    onChange={handleChange}
                    required
                    disabled={sending}
                    aria-invalid={!fechaIniValida}
                  />
                </div>
                {form.fechaInicio && form.fechaFin && (
                  <small className="hint">
                    Período: {humanRange(form.fechaInicio, form.fechaFin)}{' '}
                    {diasPeriodo !== null && `(${diasPeriodo} días)`}
                  </small>
                )}
              </div>

              {/* Fecha fin (auto) */}
              <div className="filter-field">
                <label>Fecha fin</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input
                    className="modern-input"
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    value={form.fechaFin}
                    onChange={() => {}}
                    required
                    disabled
                    aria-invalid={!fechaFinValida || rangoInvalido}
                    title={`Se calcula automáticamente como inicio + ${RANGO_DIAS} días`}
                  />
                </div>
                <small className="hint">
                  La fecha fin se calcula automáticamente como inicio + {RANGO_DIAS} días.
                </small>
                {rangoInvalido && (
                  <small className="hint" style={{ color: '#b91c1c' }}>
                    El rango de fechas no es válido. Vuelve a seleccionar la fecha de inicio.
                  </small>
                )}
              </div>

              {/* Estado */}
              <div className="filter-field">
                <label>Estado</label>
                <div className="input-with-icon">
                  <ClipboardList size={16} className="input-icon" />
                  <select
                    className="modern-select"
                    id="estado"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    disabled={sending}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Acciones secundarias */}
            <div className="filter-actions" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn-secondary-modern"
                onClick={() =>
                  setForm({ nombre: '', fechaInicio: '', fechaFin: '', estado: ESTADOS[0] })
                }
                disabled={sending}
                title="Limpiar formulario"
              >
                <AlertTriangle size={16} />
                Limpiar
              </button>

              <div className="results-count" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {disableSubmit ? (
                  <>
                    <XCircle size={16} style={{ color: '#dc2626' }} />
                    <span>Completa los campos requeridos</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                    <span>Listo para guardar</span>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Tarjetas de preview (consistencia visual con Empleado) */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number" style={{ fontSize: '1.25rem' }}>
              {form.fechaInicio && form.fechaFin ? humanRange(form.fechaInicio, form.fechaFin) : '—'}
            </span>
            <span className="stat-label">Rango de la planilla</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{diasPeriodo ?? '—'}</span>
            <span className="stat-label">Duración (días)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ClipboardList size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-number" style={{ fontSize: '1.25rem' }}>{form.estado}</span>
            <span className="stat-label">Estado seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
