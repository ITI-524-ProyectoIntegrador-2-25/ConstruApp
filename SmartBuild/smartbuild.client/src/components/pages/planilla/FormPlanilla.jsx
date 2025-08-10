// src/components/pages/planilla/FormPlanilla.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import '../../../styles/Dashboard.css';
import './FormPlanilla.css';
import { insertPlanilla, getPlanilla } from '../../../api/Planilla';

const ESTADOS = ['Abierta', 'Revisión', 'Cerrada'];

function toYYYYMMDD(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}
function computeQuincenaEnd(startYYYYMMDD) {
  if (!startYYYYMMDD) return '';
  const d = new Date(`${startYYYYMMDD}T00:00:00`);
  if (isNaN(d)) return '';
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return day <= 15 ? toYYYYMMDD(new Date(y, m, 15)) : toYYYYMMDD(new Date(y, m + 1, 0));
}
function humanRange(ini, fin) {
  if (!ini || !fin) return '';
  const i = new Date(`${ini}T00:00:00`);
  const f = new Date(`${fin}T00:00:00`);
  const fmt = (dt) => dt.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  return `${fmt(i)} – ${fmt(f)}`;
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

  const getUsuario = () => {
    try {
      const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return u.correo || u.usuario || '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const usuario = getUsuario();
    if (!usuario) return;
    getPlanilla(usuario)
      .then(list => {
        const names = Array.isArray(list) ? list.map(p => sanitizeName(p?.nombre)) : [];
        setAllNames(names.filter(Boolean));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.fechaInicio) {
      const fin = computeQuincenaEnd(form.fechaInicio);
      setForm(f => ({ ...f, fechaFin: fin }));
    } else {
      setForm(f => ({ ...f, fechaFin: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fechaInicio]);

  const nombreSan = sanitizeName(form.nombre);
  const nombreDuplicado = useMemo(
    () => nombreSan && allNames.includes(nombreSan),
    [nombreSan, allNames]
  );
  const nombreCorto = form.nombre.trim().length > 0 && form.nombre.trim().length < 3;
  const nombreMuyLargo = form.nombre.trim().length > 80;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const disableSubmit =
    sending ||
    !form.nombre.trim() ||
    !form.fechaInicio ||
    !form.fechaFin ||
    !ESTADOS.includes(form.estado) ||
    nombreDuplicado ||
    nombreCorto ||
    nombreMuyLargo;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (disableSubmit) {
      setError('Revisá los datos del formulario.');
      return;
    }

    const usuario = getUsuario();
    if (!usuario) {
      setError('Usuario no autenticado');
      return;
    }

    const ts = new Date().toISOString();
    const fechaFinForzada = computeQuincenaEnd(form.fechaInicio);

    const payload = {
      usuario,
      quienIngreso: usuario,
      cuandoIngreso: ts,
      quienModifico: usuario,
      cuandoModifico: ts,
      idPlanilla: 0,
      nombre: form.nombre.trim(),
      fechaInicio: new Date(`${form.fechaInicio}T00:00:00`).toISOString(),
      fechaFin: new Date(`${fechaFinForzada}T23:59:59`).toISOString(),
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

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar" aria-label="Regresar">
          <ChevronLeft size={20} />
        </button>
        <h1>Nueva Planilla</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        <div className="form-group">
          <label>Nombre</label>
          <input
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
            disabled={sending}
            maxLength={80}
            placeholder="Ej. Planilla 1ra quincena agosto"
          />
          {nombreCorto && <small className="hint">El nombre debe tener al menos 3 caracteres.</small>}
          {nombreMuyLargo && <small className="hint">Máximo 80 caracteres.</small>}
          {nombreDuplicado && <small className="hint" style={{ color: '#b91c1c' }}>Ya existe una planilla con este nombre.</small>}
        </div>

        <div className="form-group">
          <label>Fecha inicio</label>
          <input
            name="fechaInicio"
            type="date"
            value={form.fechaInicio}
            onChange={handleChange}
            required
            disabled={sending}
          />
          {form.fechaInicio && form.fechaFin && (
            <small className="hint">
              Período: {humanRange(form.fechaInicio, form.fechaFin)} (quincenal)
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Fecha fin</label>
          <input
            name="fechaFin"
            type="date"
            value={form.fechaFin}
            onChange={() => {}}
            required
            disabled
          />
          <small className="hint">La fecha fin se calcula automáticamente según la quincena.</small>
        </div>

        <div className="form-group">
          <label>Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            disabled={sending}
          >
            {ESTADOS.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-submit" disabled={disableSubmit}>
          {sending ? 'Guardando…' : 'Guardar planilla'}
        </button>
      </form>
    </div>
  );
}
