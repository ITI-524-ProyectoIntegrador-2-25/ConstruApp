// src/components/pages/planilla/scripts/FormPlanilla.jsx
import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Calendar, Hash, ClipboardList, Save,
  AlertTriangle, CheckCircle2, XCircle, FileSpreadsheet
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import Select, { components as RS } from 'react-select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import '../../../../styles/Dashboard.css';
import '../css/Planilla.css';
import '../css/FormPlanilla.css';

import { sanitizeName } from '../../../../utils/strings';
import { getUsuarioOrThrow } from '../../../../utils/user';
import { usePlanillas, useInsertarPlanilla } from '../../../../hooks/Planilla';
import { addDaysYMD, parseYMD } from '../../../../utils/date';

const ESTADOS = ['Abierta', 'Pendiente', 'En revisión', 'Cerrada'];
const ESTADO_OPTS = ESTADOS.map(e => ({ value: e, label: e }));
const RANGO_DIAS = 14;

/* Helpers fecha */
function normalizeYMD(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
function humanRange(ini, fin) {
  if (!ini || !fin) return '—';
  try {
    const i = new Date(`${ini}T00:00:00Z`);
    const f = new Date(`${fin}T00:00:00Z`);
    const fmt = (dt) => dt.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${fmt(i)} – ${fmt(f)}`;
  } catch { return '—'; }
}

/* react-select con icono */
const ControlWithIcon = (props) => (
  <RS.Control {...props} className="rs-control-with-icon">
    <ClipboardList size={16} className="rs-control-icon" />
    {props.children}
  </RS.Control>
);

/* Estilos inline (clonan .modern-input) + portal visible */
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44, height: 44, cursor: 'pointer', borderRadius: 12,
    backgroundColor: 'var(--clr-white)',
    borderColor: state.isFocused ? 'var(--clr-primary)' : 'var(--clr-border)',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(37,99,235,.15)' : 'none',
    transition: 'border-color .2s, box-shadow .2s',
    '&:hover': { borderColor: state.isFocused ? 'var(--clr-primary)' : '#d1d5db' },
  }),
  valueContainer: (b) => ({ ...b, paddingLeft: '2.5rem', paddingRight: '.75rem' }),
  input: (b) => ({ ...b, margin: 0, padding: 0 }),
  singleValue: (b) => ({ ...b, color: 'var(--clr-text)' }),
  placeholder: (b) => ({ ...b, color: 'var(--clr-muted)' }),
  indicatorSeparator: (b) => ({ ...b, backgroundColor: '#e5e7eb', margin: 0 }),
  dropdownIndicator: (b, s) => ({ ...b, color: s.isFocused ? '#64748b' : '#94a3b8', '&:hover': { color: '#64748b' } }),
  menuPortal: (b) => ({ ...b, zIndex: 2000 }),
  menu: (b) => ({ ...b, marginTop: 6, border: '1px solid var(--clr-border)', borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 12px 24px rgba(0,0,0,.08)' }),
  menuList: (b) => ({ ...b, padding: '4px 0' }),
  option: (b, s) => ({
    ...b, padding: '8px 12px', cursor: 'pointer',
    backgroundColor: s.isSelected ? 'var(--clr-primary)' : s.isFocused ? '#f3f4f6' : 'white',
    color: s.isSelected ? 'white' : 'var(--clr-text)',
  }),
};

export default function FormPlanilla() {
  const navigate = useNavigate();
  const alertRef = useRef(null);

  const { Planillas } = usePlanillas();
  const { insertarPlanilla, loading: sendingApi, error: saveError } = useInsertarPlanilla();

  const existingNames = useMemo(
    () => (Array.isArray(Planillas) ? Planillas.map(p => sanitizeName(p?.nombre)).filter(Boolean) : []),
    [Planillas]
  );

  /* ✅ Requerimos fechaInicio/fechaFin, y fin = inicio + 14 */
  const schema = useMemo(() => z.object({
    nombre: z.string().trim().min(3, 'Mínimo 3 caracteres').max(80, 'Máximo 80 caracteres')
      .refine(v => !existingNames.includes(sanitizeName(v)), 'Ya existe una planilla con este nombre'),
    fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    fechaFin:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    estado: z.enum(ESTADOS, { errorMap: () => ({ message: 'Estado inválido' }) }),
  }).superRefine((val, ctx) => {
    const finEsperada = addDaysYMD(val.fechaInicio, RANGO_DIAS);
    if (val.fechaFin !== finEsperada) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `La fecha fin debe ser inicio + ${RANGO_DIAS} días`, path: ['fechaFin'] });
    }
  }), [existingNames]);

  const {
    register, handleSubmit, setValue, watch, control,
    formState: { errors, isSubmitting, isValid, dirtyFields }
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { nombre: '', fechaInicio: '', fechaFin: '', estado: ESTADOS[0] }
  });

  const fechaInicio = watch('fechaInicio');
  const fechaFin = watch('fechaFin');
  const estadoSel = watch('estado');

  /* Autocalcula fechaFin al elegir inicio */
  useEffect(() => {
    if (!fechaInicio) { setValue('fechaFin', '', { shouldValidate: true }); return; }
    const ymd = normalizeYMD(fechaInicio);
    if (!ymd) { setValue('fechaFin', '', { shouldValidate: true }); return; }
    if (ymd !== fechaInicio) setValue('fechaInicio', ymd, { shouldValidate: true, shouldDirty: true });
    setValue('fechaFin', addDaysYMD(ymd, RANGO_DIAS), { shouldValidate: true });
  }, [fechaInicio, setValue]);

  const onSubmit = async (data) => {
    const usuario = getUsuarioOrThrow();
    const ts = new Date().toISOString();

    const payload = {
      usuario,
      quienIngreso: usuario, cuandoIngreso: ts,
      quienModifico: usuario, cuandoModifico: ts,
      idPlanilla: 0,
      nombre: data.nombre.trim(),
      fechaInicio: new Date(`${data.fechaInicio}T00:00:00Z`).toISOString(),
      fechaFin:    new Date(`${data.fechaFin}T23:59:59Z`).toISOString(),
      estado: data.estado,
    };

    const ok = await insertarPlanilla(payload);
    if (ok) navigate(-1);
    else alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const disableSubmit = sendingApi || isSubmitting || !isValid;

  const diasPeriodo = useMemo(() => {
    const i = parseYMD(fechaInicio);
    const f = parseYMD(fechaFin);
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
          {saveError && (
            <div ref={alertRef} className="alert" role="alert" style={{
              background:'#fee2e2', border:'1px solid #fecaca', color:'#991b1b',
              padding:'0.75rem 1rem', borderRadius:12, display:'flex', alignItems:'center', gap:8, marginBottom:'1rem'
            }}>
              <XCircle size={18} /><span>{saveError}</span>
            </div>
          )}

          <form id="form-planilla" onSubmit={handleSubmit(onSubmit)}>
            <div className="filter-row">
              {/* Nombre */}
              <div className="filter-field">
                <label>Nombre</label>
                <div className="input-with-icon">
                  <Hash size={16} className="input-icon" />
                  <input className="modern-input" type="text" placeholder="Ej. Planilla 1ra quincena agosto"
                    maxLength={80} aria-invalid={!!errors.nombre} {...register('nombre')} />
                </div>
                {errors.nombre && <small className="hint" style={{ color:'#b91c1c' }}>{errors.nombre.message}</small>}
              </div>

              {/* Fecha inicio */}
              <div className="filter-field">
                <label>Fecha inicio</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input className="modern-input" type="date" aria-invalid={!!errors.fechaInicio} {...register('fechaInicio')} />
                </div>
                {errors.fechaInicio && <small className="hint" style={{ color:'#b91c1c' }}>{errors.fechaInicio.message}</small>}
              </div>

              {/* Fecha fin (auto) */}
              <div className="filter-field">
                <label>Fecha fin</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input className="modern-input" type="date" disabled aria-invalid={!!errors.fechaFin} {...register('fechaFin')} />
                </div>
                <small className="hint">Se calcula automáticamente como inicio + {RANGO_DIAS} días.</small>
                {/* 👇 Ocultamos el error hasta que el usuario haya puesto fechaInicio */}
                {fechaInicio && errors.fechaFin && (
                  <small className="hint" style={{ color:'#b91c1c' }}>{errors.fechaFin.message}</small>
                )}
              </div>

              {/* Estado */}
              <div className="filter-field">
                <label>Estado</label>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select
                      inputId="estado"
                      className="rs rs--with-icon"
                      classNamePrefix="rs"
                      components={{ Control: ControlWithIcon }}
                      options={ESTADO_OPTS}
                      value={ESTADO_OPTS.find(o => o.value === field.value) || null}
                      onChange={(opt) => field.onChange(opt?.value || ESTADOS[0])}
                      placeholder="Selecciona estado"
                      isSearchable={false}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  )}
                />
              </div>
            </div>

            <div className="filter-actions" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn-secondary-modern"
                onClick={() => {
                  // limpia sin mostrar errores de fecha fin al abrir
                  setValue('nombre','', { shouldValidate:true });
                  setValue('fechaInicio','', { shouldValidate:true });
                  setValue('fechaFin','', { shouldValidate:true });
                  setValue('estado', ESTADOS[0], { shouldValidate:true });
                }}>
                <AlertTriangle size={16} /> Limpiar
              </button>

              <div className="results-count" style={{ display:'flex', alignItems:'center', gap:8 }}>
                {isValid ? (
                  <><CheckCircle2 size={16} style={{ color:'#16a34a' }} /><span>Listo para guardar</span></>
                ) : (
                  <><XCircle size={16} style={{ color:'#dc2626' }} /><span>Completa los campos requeridos</span></>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={20} /></div>
          <div className="stat-content">
            <span className="stat-number" style={{ fontSize:'1.25rem' }}>
              {humanRange(normalizeYMD(fechaInicio), normalizeYMD(fechaFin))}
            </span>
            <span className="stat-label">Rango de la planilla</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={20} /></div>
          <div className="stat-content"><span className="stat-number">{diasPeriodo}</span><span className="stat-label">Duración (días)</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ClipboardList size={20} /></div>
          <div className="stat-content"><span className="stat-number" style={{ fontSize:'1.25rem' }}>{estadoSel}</span>
            <span className="stat-label">Estado seleccionado</span></div>
        </div>
      </div>
    </div>
  );
}
