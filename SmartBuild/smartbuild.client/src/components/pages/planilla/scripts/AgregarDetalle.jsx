import React, { useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar, User, Building2, Clock, XCircle, CheckCircle2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import '../css/Planilla.css';
import { usePlanillas, usePlanillaDetalles, useInsertarPlanillaDetalle } from '../../../../hooks/Planilla';
import { useEmpleados } from '../../../../hooks/Empleados';
import { usePresupuestos } from '../../../../hooks/dashboard';
import { dateOnly } from '../../../../utils/date';
import { getUsuarioOrThrow } from '../../../../utils/user';

/* ====== Estilos react-select ====== */
const selectStyles = {
  valueContainer: (b) => ({ ...b, paddingLeft: '2.5rem', paddingRight: '.75rem' }),
  menuPortal: (b) => ({ ...b, zIndex: 9999 }),
  menu: (b) => ({
    ...b,
    marginTop: 6,
    border: '1px solid var(--clr-border)',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 12px 24px rgba(0,0,0,.08)',
  }),
  option: (b, s) => ({
    ...b,
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: s.isSelected ? 'var(--clr-primary)' : s.isFocused ? '#f3f4f6' : 'white',
    color: s.isSelected ? 'white' : 'var(--clr-text)',
  }),
};

/* ====== Utilidades ====== */
const half = (v) => Number.isFinite(Number(v)) && Math.round(Number(v) * 2) === Number(v) * 2;
const arrFrom = (x) =>
  (Array.isArray(x) ? x
    : Array.isArray(x?.data) ? x.data
    : Array.isArray(x?.items) ? x.items
    : Array.isArray(x?.Presupuestos) ? x.Presupuestos
    : Array.isArray(x?.Empleados) ? x.Empleados
    : []);

const pickNum = (o, ks) => { for (const k of ks) { const n = Number(o?.[k]); if (Number.isFinite(n)) return n; } return NaN; };
const pickStr = (o, ks) => { for (const k of ks) { const v = o?.[k]; if (typeof v === 'string' && v.trim()) return v; } return ''; };

const toDisplayName = (e = {}) => {
  const full = (e.displayName || e.nombreEmpleado || e.NombreEmpleado || '').trim?.() || '';
  if (full) return full;
  const parts = [
    e.nombre || e.Nombre,
    e.primerApellido || e.PrimerApellido || e.apellido || e.Apellido,
    e.segundoApellido || e.SegundoApellido
  ].filter(Boolean);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
};

const truthy = (v) => {
  const s = String(v).trim().toLowerCase();
  return v === true || v === 1 || s === '1' || s === 'true' || s === 'activo' || s === 'activa';
};
const isEmpleadoActivo = (e = {}) => {
  const keys = ['activo','Activo','estado','Estado','estadoEmpleado','EstadoEmpleado','estatus','Estatus','isActive','IsActive'];
  const found = keys.find(k => e[k] !== undefined && e[k] !== null);
  if (found === undefined) return true; // si no hay bandera, asumimos activo
  return truthy(e[found]);
};
const getSalarioEmpleado = (e = {}) => {
  const keys = ['salarioHora','salario','salarioXHora','SalarioHora','Salario','sueldo','Sueldo'];
  for (const k of keys) {
    const n = Number(e?.[k]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
};

/* ====== Opciones para selects ====== */
const mapEmpleadoOptions = (src) =>
  arrFrom(src)
    .filter(isEmpleadoActivo) // 👈 solo activos en el combo
    .map((e) => {
      const id = Number(e.idEmpleado ?? e.IdEmpleado ?? e.empleadoID ?? e.EmpleadoID ?? e.id ?? e.Id);
      if (!Number.isFinite(id)) return null;
      return { value: id, label: toDisplayName(e) || `Empleado ${id}`, salario: getSalarioEmpleado(e), raw: e };
    })
    .filter(Boolean);

const PRES_ID_KEYS = ['idPresupuesto','IdPresupuesto','presupuestoID','PresupuestoID','id_presupuesto','presupuestoId','PresupuestoId','id','Id'];
const PRES_NAME_KEYS = ['descripcion','Descripcion','nombre','Nombre','proyecto','Proyecto','proyectoNombre','ProyectoNombre','presupuestoNombre','PresupuestoNombre','titulo','Titulo','name','Name'];

const mapPresupuestoOptions = (src) =>
  arrFrom(src)
    .map((p) => {
      const id = pickNum(p, PRES_ID_KEYS);
      if (!Number.isFinite(id)) return null;
      const label = pickStr(p, PRES_NAME_KEYS) || `Proyecto ${id}`;
      return { value: id, label, raw: p };
    })
    .filter(Boolean);

/* ====== Límites lógicos de horas (ajustables) ====== */
const LIMITS = {
  ORDINARIAS_MIN: 0.5,
  ORDINARIAS_MAX: 12,
  EXTRAS_MAX: 8,
  DOBLES_MAX: 4,
  TOTAL_EXTRAS_DOBLES_MAX: 8,
  TOTAL_DIA_MAX: 16,   // defensa lógica (además del tope técnico 24)
};

export default function AgregarDetalle() {
  const { idPlanilla } = useParams();
  const idPlan = Number(idPlanilla);
  const navigate = useNavigate();
  const alertRef = useRef(null);

  const { Planillas } = usePlanillas();
  const { Detalles } = usePlanillaDetalles(idPlan);
  const { insertarPlanillaDetalle, loading: sendingApi, error: saveError } = useInsertarPlanillaDetalle();
  const { Empleados, loading: loadingEmpleados } = useEmpleados();
  const { presupuestos: Presupuestos, loading: loadingPresupuestos, error: errorPresupuestos } = usePresupuestos();

  const plan = useMemo(
    () => (Array.isArray(Planillas) ? Planillas.find((p) => Number(p?.idPlanilla ?? p?.IdPlanilla) === idPlan) : null),
    [Planillas, idPlan]
  );
  const rango = useMemo(
    () => ({ ini: plan?.fechaInicio ? dateOnly(plan.fechaInicio) : '', fin: plan?.fechaFin ? dateOnly(plan.fechaFin) : '' }),
    [plan]
  );

  /* ====== Esquema con validaciones reforzadas ====== */
  const schema = useMemo(() =>
    z.object({
      fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
        .refine((v) => !!rango.ini && !!rango.fin && v >= rango.ini && v <= rango.fin, `La fecha debe estar entre ${rango.ini} y ${rango.fin}`),
      empleado: z.object({ value: z.number(), label: z.string() }).nullable().refine(Boolean, { message: 'Empleado requerido' }),
      presupuesto: z.object({ value: z.number(), label: z.string() }).nullable().refine(Boolean, { message: 'Proyecto requerido' }),
      salarioHora: z.preprocess(v => Number(v), z.number().gt(0, 'El salario del empleado es requerido')),
      horasOrdinarias: z.preprocess(v => Number(v),
        z.number()
          .refine(half, 'Debe ser múltiplo de 0.5')
          .min(LIMITS.ORDINARIAS_MIN, `Mínimo ${LIMITS.ORDINARIAS_MIN} h`)
          .max(LIMITS.ORDINARIAS_MAX, `Máximo ${LIMITS.ORDINARIAS_MAX} h`)
      ),
      horasExtras: z.preprocess(v => Number(v),
        z.number()
          .refine(half, 'Debe ser múltiplo de 0.5')
          .min(0, 'No puede ser negativo')
          .max(LIMITS.EXTRAS_MAX, `Máximo ${LIMITS.EXTRAS_MAX} h`)
      ).default(0),
      horasDobles: z.preprocess(v => Number(v),
        z.number()
          .refine(half, 'Debe ser múltiplo de 0.5')
          .min(0, 'No puede ser negativo')
          .max(LIMITS.DOBLES_MAX, `Máximo ${LIMITS.DOBLES_MAX} h`)
      ).default(0),
    }).superRefine((val, ctx) => {
      const empleadosArr = arrFrom(Empleados);
      const emp = empleadosArr.find(e =>
        Number(e.idEmpleado ?? e.IdEmpleado ?? e.empleadoID ?? e.EmpleadoID) === val.empleado?.value
      );

      // 1) Empleado activo
      if (!emp || !isEmpleadoActivo(emp)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El empleado está inactivo. No se puede registrar detalle.', path: ['empleado'] });
      }

      // 2) Salario coherente con el empleado seleccionado
      const salarioCat = getSalarioEmpleado(emp);
      if (!Number.isFinite(salarioCat) || salarioCat <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El empleado no tiene salario válido configurado.', path: ['salarioHora'] });
      } else if (Number(val.salarioHora) !== Number(salarioCat)) {
        // defensa en profundidad: el salario debe ser el del catálogo
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El salario no coincide con el del empleado.', path: ['salarioHora'] });
      }

      // 3) No duplicar (empleado+fecha)
      const dup = (Array.isArray(Detalles) ? Detalles : []).some(
        (d) => dateOnly(d?.fecha) === val.fecha && Number(d?.idEmpleado ?? d?.IdEmpleado) === val.empleado?.value
      );
      if (dup) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ya existe un registro de este empleado en esa fecha', path: ['empleado'] });
      }

      // 4) Reglas lógicas de horas
      const ord = Number(val.horasOrdinarias || 0);
      const ext = Number(val.horasExtras || 0);
      const dob = Number(val.horasDobles || 0);

      if (ext + dob > LIMITS.TOTAL_EXTRAS_DOBLES_MAX) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `La suma de extras y dobles no puede superar ${LIMITS.TOTAL_EXTRAS_DOBLES_MAX} h`,
          path: ['horasExtras'],
        });
      }

      const total = ord + ext + dob;
      if (total > LIMITS.TOTAL_DIA_MAX) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Las horas totales por día no pueden superar ${LIMITS.TOTAL_DIA_MAX} h`,
          path: ['horasOrdinarias'],
        });
      }

      // Tope técnico adicional (defensa)
      if (total > 24) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La suma de horas no puede exceder 24 h',
          path: ['horasOrdinarias'],
        });
      }
    }), [Detalles, Empleados, rango.ini, rango.fin]
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    watch,
    formState: { errors, isValid, isDirty, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      fecha: '',
      empleado: null,
      presupuesto: null,
      salarioHora: '',
      horasOrdinarias: 8,
      horasExtras: 0,
      horasDobles: 0,
    },
  });

  const empleadoOptions = useMemo(() => mapEmpleadoOptions(Empleados), [Empleados]);
  const presupuestoOptions = useMemo(() => mapPresupuestoOptions(Presupuestos), [Presupuestos]);

  /* ====== Salario automático desde el empleado (solo lectura) ====== */
  useEffect(() => {
    const empSel = watch('empleado');
    if (!empSel) return;
    // tratamos de leer desde options (traen 'salario')
    const opt = empleadoOptions.find(o => o.value === Number(empSel.value));
    const s = Number(opt?.salario);
    if (Number.isFinite(s) && s > 0) {
      setValue('salarioHora', s, { shouldDirty: true });
      clearErrors('salarioHora');
    } else {
      setValue('salarioHora', '', { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('empleado'), empleadoOptions]);

  const onSubmit = async (values) => {
    const usuario = getUsuarioOrThrow();
    const ts = new Date().toISOString();

    const payload = {
      PlanillaID: idPlan, idPlanilla: idPlan,
      Fecha: new Date(`${values.fecha}T00:00:00Z`).toISOString(),
      fecha: new Date(`${values.fecha}T00:00:00Z`).toISOString(),
      IdEmpleado: values.empleado.value, idEmpleado: values.empleado.value,
      EmpleadoNombre: values.empleado.label, empleadoNombre: values.empleado.label,
      IdPresupuesto: values.presupuesto.value, idPresupuesto: values.presupuesto.value,
      PresupuestoNombre: values.presupuesto.label, presupuestoNombre: values.presupuesto.label,
      SalarioHora: Number(values.salarioHora), salarioHora: Number(values.salarioHora),
      HorasOrdinarias: Number(values.horasOrdinarias), horasOrdinarias: Number(values.horasOrdinarias),
      HorasExtras: Number(values.horasExtras), horasExtras: Number(values.horasExtras),
      HorasDobles: Number(values.horasDobles), horasDobles: Number(values.horasDobles),
      usuario, quienIngreso: usuario, cuandoIngreso: ts, quienModifico: usuario, cuandoModifico: ts,
    };

    const ok = await insertarPlanillaDetalle(payload);
    if (ok) navigate(-1);
    else alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="page-header" initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} aria-label="Volver"><ChevronLeft size={20} /></button>
          <div className="title-section"><h1 className="page-title"><Plus size={20} /> Agregar detalle</h1></div>
        </div>
        <div className="header-actions">
          <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} type="submit" form="form-detalle" className="btn-primary-modern" disabled={sendingApi || isSubmitting}><Save size={16}/> Guardar</motion.button>
        </div>
      </motion.div>

      <motion.div className="filters-panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="filters-content">
          <AnimatePresence>
            {saveError && (
              <motion.div
                key="alert"
                ref={alertRef}
                className="alert"
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{ background:'#fee2e2', border:'1px solid #fecaca', color:'#991b1b',
                         padding:'0.75rem 1rem', borderRadius:12, display:'flex',
                         alignItems:'center', gap:8, marginBottom:'1rem' }}
              >
                <XCircle size={18} /><span>{saveError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form id="form-detalle" onSubmit={handleSubmit(onSubmit)} initial="hidden" animate="show" transition={{ staggerChildren: 0.05 }}>
            <div className="filter-row">
              {/* Fecha */}
              <motion.div className="filter-field" variants={item}>
                <label>Fecha</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input className="modern-input" type="date" min={rango.ini} max={rango.fin} aria-invalid={!!errors.fecha} {...register('fecha')} />
                </div>
                {errors.fecha && <small className="hint" style={{ color:'#b91c1c' }}>{errors.fecha.message}</small>}
                {rango.ini && rango.fin && <small className="hint">Rango permitido: {rango.ini} – {rango.fin}</small>}
              </motion.div>

              {/* Empleado (solo activos) */}
              <motion.div className="filter-field" variants={item}>
                <label>Empleado</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <Controller
                    name="empleado"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={empleadoOptions}
                        placeholder="Selecciona empleado"
                        noOptionsMessage={() => 'Sin opciones'}
                        loadingMessage={() => 'Cargando…'}
                        isLoading={!!loadingEmpleados}
                        isDisabled={!!loadingEmpleados}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </div>
                {errors.empleado && <small className="hint" style={{ color:'#b91c1c' }}>{errors.empleado.message}</small>}
              </motion.div>

              {/* Proyecto */}
              <motion.div className="filter-field" variants={item}>
                <label>Proyecto</label>
                <div className="input-with-icon">
                  <Building2 size={16} className="input-icon" />
                  <Controller
                    name="presupuesto"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={presupuestoOptions}
                        placeholder="Selecciona proyecto"
                        noOptionsMessage={() => (errorPresupuestos ? 'Error al cargar' : 'Sin opciones')}
                        loadingMessage={() => 'Cargando…'}
                        isLoading={!!loadingPresupuestos}
                        isDisabled={!!loadingPresupuestos}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </div>
                {errors.presupuesto && <small className="hint" style={{ color:'#b91c1c' }}>{errors.presupuesto.message}</small>}
              </motion.div>

              {/* Salario (solo lectura, viene del empleado) */}
              <motion.div className="filter-field" variants={item}>
                <label>Salario/Hora</label>
                <div className="input-with-icon">
                  <Clock size={16} className="input-icon" />
                  <input
                    className="modern-input"
                    type="number"
                    step="0.01"
                    min="0"
                    readOnly
                    {...register('salarioHora', { valueAsNumber: true })}
                    style={{ background: '#f9fafb', cursor: 'not-allowed' }}
                    title="Se obtiene del empleado seleccionado."
                  />
                </div>
                {errors.salarioHora && <small className="hint" style={{ color:'#b91c1c' }}>{errors.salarioHora.message}</small>}
                <small className="hint">Se obtiene del empleado seleccionado.</small>
              </motion.div>

              {/* Horas */}
              {['horasOrdinarias','horasExtras','horasDobles'].map((name, i) => (
                <motion.div className="filter-field" variants={item} key={name}>
                  <label>{['Horas Ordinarias','Horas Extras','Horas Dobles'][i]}</label>
                  <div className="input-with-icon">
                    <Clock size={16} className="input-icon" />
                    <input
                      className="modern-input"
                      type="number"
                      step="0.5"
                      min={name === 'horasOrdinarias' ? LIMITS.ORDINARIAS_MIN : 0}
                      max={name === 'horasOrdinarias'
                        ? LIMITS.ORDINARIAS_MAX
                        : name === 'horasExtras'
                          ? LIMITS.EXTRAS_MAX
                          : LIMITS.DOBLES_MAX}
                      aria-invalid={!!errors[name]}
                      {...register(name)}
                    />
                  </div>
                  {errors[name] && <small className="hint" style={{ color:'#b91c1c' }}>{errors[name].message}</small>}
                </motion.div>
              ))}
            </div>

            {/* Estado del formulario */}
            <motion.div className="filter-actions" style={{ marginTop: 8 }} variants={item}>
              <div className="results-count" style={{ display:'flex', alignItems:'center', gap:8 }}>
                {!saveError && isValid && isDirty
                  ? (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ok-msg">
                      <CheckCircle2 size={16} style={{ color:'#16a34a' }}/> <span>Listo para guardar</span>
                    </motion.span>)
                  : (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <XCircle size={16} style={{ color:'#dc2626' }}/> <span>Rellena todos los campos</span>
                    </motion.span>)}
              </div>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
}
