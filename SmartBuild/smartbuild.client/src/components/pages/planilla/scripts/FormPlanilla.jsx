
import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Calendar, Hash, ClipboardList, Save,
  AlertTriangle, CheckCircle2, XCircle, FileSpreadsheet
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import '../../../../styles/Dashboard.css';
import '../css/Planilla.css';
import '../css/FormPlanilla.css';

import { sanitizeName } from '../../../../utils/strings';
import { getUsuarioOrThrow } from '../../../../utils/user';
import { usePlanillas, useInsertarPlanilla } from '../../../../hooks/Planilla';

const ESTADOS = ['Abierta', 'Revisión', 'Cerrada'];
const RANGO_DIAS = 15;

function toYYYYMMDD(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function parseYYYYMMDD(ymd) {
  if (!ymd || typeof ymd !== 'string') return null;
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return Number.isNaN(dt.getTime()) ? null : dt;
}
function addDaysYYYYMMDD(ymd, days) {
  const base = parseYYYYMMDD(ymd);
  if (!base) return '';
  base.setUTCDate(base.getUTCDate() + days);
  return toYYYYMMDD(base);
}
function humanRange(ini, fin) {
  if (!ini || !fin) return '—';
  try {
    const i = new Date(`${ini}T00:00:00`);
    const f = new Date(`${fin}T00:00:00`);
    const fmt = (dt) => dt.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${fmt(i)} – ${fmt(f)}`;
  } catch { return '—'; }
}

export default function FormPlanilla() {
  const navigate = useNavigate();
  const alertRef = useRef(null);

  const { Planillas } = usePlanillas();
  const { insertarPlanilla, loading: sendingApi, error: saveError } = useInsertarPlanilla();

  const existingNames = useMemo(
    () => (Array.isArray(Planillas) ? Planillas.map(p => sanitizeName(p?.nombre)).filter(Boolean) : []),
    [Planillas]
  );

  const schema = useMemo(() => z.object({
    nombre: z.string().trim().min(3, 'Mínimo 3 caracteres').max(80, 'Máximo 80 caracteres')
      .refine(v => !existingNames.includes(sanitizeName(v)), 'Ya existe una planilla con este nombre'),
    fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    estado: z.enum(ESTADOS, { errorMap: () => ({ message: 'Estado inválido' }) }),
  }).superRefine((val, ctx) => {
    const finEsperada = addDaysYYYYMMDD(val.fechaInicio, RANGO_DIAS);
    if (val.fechaFin !== finEsperada) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `La fecha fin debe ser inicio + ${RANGO_DIAS} días`, path: ['fechaFin'] });
    }
  }), [existingNames]);

  const {
    register, handleSubmit, setValue, watch, formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', fechaInicio: '', fechaFin: '', estado: ESTADOS[0] }
  });

  const fechaInicio = watch('fechaInicio');
  const fechaFin = watch('fechaFin');

  useEffect(() => {
    if (fechaInicio) setValue('fechaFin', addDaysYYYYMMDD(fechaInicio, RANGO_DIAS), { shouldValidate: true });
    else setValue('fechaFin', '', { shouldValidate: true });
  }, [fechaInicio, setValue]);

  const onSubmit = async (data) => {
    const usuario = getUsuarioOrThrow();
    const ts = new Date().toISOString();

    const payload = {
      usuario,
      quienIngreso: usuario,
      cuandoIngreso: ts,
      quienModifico: usuario,
      cuandoModifico: ts,
      idPlanilla: 0,
      nombre: data.nombre.trim(),
      fechaInicio: new Date(`${data.fechaInicio}T00:00:00`).toISOString(),
      fechaFin: new Date(`${data.fechaFin}T23:59:59`).toISOString(),
      estado: data.estado,
    };

    const ok = await insertarPlanilla(payload);
    if (ok) navigate(-1);
    else alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const disableSubmit = sendingApi || isSubmitting;

  const diasPeriodo = useMemo(() => {
    const i = parseYYYYMMDD(fechaInicio);
    const f = parseYYYYMMDD(fechaFin);
    if (!i || !f) return '—';
    return Math.round((f.getTime() - i.getTime()) / 86400000);
  }, [fechaInicio, fechaFin]);

  return (
    <div className="form-planilla-modern">
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} title="Volver" aria-label="Volver">
            <ChevronLeft size={20} />
          </button>
          <div className="title-section">
            <h1 className="page-title"><FileSpreadsheet size={28} />Nueva Planilla</h1>
            <p className="page-subtitle">Define el periodo y estado de la planilla</p>
          </div>
        </div>
        <div className="header-actions">
          <button type="submit" form="form-planilla" className="btn-primary-modern" disabled={disableSubmit} title="Guardar planilla">
            <Save size={16} /> {sendingApi ? 'Guardando…' : 'Guardar planilla'}
          </button>
        </div>
      </div>

      <div className="filters-panel" style={{ borderRadius: '0 0 20px 20px' }}>
        <div className="filters-content">
          {(saveError) && (
            <div ref={alertRef} className="alert" role="alert" style={{ background:'#fee2e2', border:'1px solid #fecaca', color:'#991b1b',
              padding:'0.75rem 1rem', borderRadius:12, display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
              <XCircle size={18} /><span>{saveError}</span>
            </div>
          )}

          <form id="form-planilla" onSubmit={handleSubmit(onSubmit)}>
            <div className="filter-row">
              <div className="filter-field">
                <label>Nombre</label>
                <div className="input-with-icon">
                  <Hash size={16} className="input-icon" />
                  <input className="modern-input" type="text" placeholder="Ej. Planilla 1ra quincena agosto"
                    maxLength={80} aria-invalid={!!errors.nombre} {...register('nombre')} />
                </div>
                {errors.nombre && <small className="hint" style={{ color:'#b91c1c' }}>{errors.nombre.message}</small>}
              </div>

              <div className="filter-field">
                <label>Fecha inicio</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input className="modern-input" type="date" aria-invalid={!!errors.fechaInicio} {...register('fechaInicio')} />
                </div>
                {errors.fechaInicio && <small className="hint" style={{ color:'#b91c1c' }}>{errors.fechaInicio.message}</small>}
              </div>

              <div className="filter-field">
                <label>Fecha fin</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input className="modern-input" type="date" disabled aria-invalid={!!errors.fechaFin} {...register('fechaFin')} />
                </div>
                <small className="hint">Se calcula automáticamente como inicio + {RANGO_DIAS} días.</small>
                {errors.fechaFin && <small className="hint" style={{ color:'#b91c1c' }}>{errors.fechaFin.message}</small>}
              </div>

              <div className="filter-field">
                <label>Estado</label>
                <div className="input-with-icon">
                  <ClipboardList size={16} className="input-icon" />
                  <select className="modern-select" {...register('estado')}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="filter-actions" style={{ marginTop: 8 }}>
              <button type="button" className="btn-secondary-modern"
                onClick={() => {
                  ['nombre','fechaInicio','fechaFin','estado'].forEach(k => setValue(k, '', { shouldValidate:true }));
                  setValue('estado', ESTADOS[0], { shouldValidate:true });
                }}>
                <AlertTriangle size={16} /> Limpiar
              </button>

              <div className="results-count" style={{ display:'flex', alignItems:'center', gap:8 }}>
                {Object.keys(errors).length ? (<><XCircle size={16} style={{ color:'#dc2626' }} /><span>Completa los campos requeridos</span></>)
                  : (<><CheckCircle2 size={16} style={{ color:'#16a34a' }} /><span>Listo para guardar</span></>)}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={20} /></div>
          <div className="stat-content">
            <span className="stat-number" style={{ fontSize:'1.25rem' }}>{humanRange(fechaInicio, fechaFin)}</span>
            <span className="stat-label">Rango de la planilla</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={20} /></div>
          <div className="stat-content"><span className="stat-number">{diasPeriodo}</span><span className="stat-label">Duración (días)</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ClipboardList size={20} /></div>
          <div className="stat-content"><span className="stat-number" style={{ fontSize:'1.25rem' }}>{/* estado se ve en el select */}</span>
            <span className="stat-label">Estado seleccionado</span></div>
        </div>
      </div>
    </div>
  );
}
