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
  if (found === undefined) return true;
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

const mapEmpleadoOptions = (src) =>
  arrFrom(src)
    .filter(isEmpleadoActivo)
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

const LIMITS = {
  ORDINARIAS_MIN: 0.5,
  ORDINARIAS_MAX: 12,
  EXTRAS_MAX: 8,
  DOBLES_MAX: 4,
  TOTAL_EXTRAS_DOBLES_MAX: 8,
  TOTAL_DIA_MAX: 16,
};

export default function AgregarDetalle() {
  const { idPlanilla } = useParams();
  const idPlan = Number(idPlanilla);
  const navigate = useNavigate();
  const alertRef = useRef(null);

  const { Planillas } = usePlanillas();
  const { insertarPlanillaDetalle, loading: sendingApi, error: saveError } = useInsertarPlanillaDetalle();
  const { Empleados, loading: loadingEmpleados } = useEmpleados();
  const { presupuestos: Presupuestos, loading: loadingPresupuestos, error: errorPresupuestos } = usePresupuestos();
  const { Detalles } = usePlanillaDetalles(); // global para duplicados

  const plan = useMemo(
    () => (Array.isArray(Planillas) ? Planillas.find((p) => Number(p?.idPlanilla ?? p?.IdPlanilla) === idPlan) : null),
    [Planillas, idPlan]
  );
  const rango = useMemo(
    () => ({ ini: plan?.fechaInicio ? dateOnly(plan.fechaInicio) : '', fin: plan?.fechaFin ? dateOnly(plan.fechaFin) : '' }),
    [plan]
  );

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
    }), [rango.ini, rango.fin]
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    setError,
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

  // Índice global de duplicados por ID+fecha y Nombre+fecha
  const dupIndex = useMemo(() => {
    const set = new Set();
    (Array.isArray(Detalles) ? Detalles : []).forEach(d => {
      const dFecha = dateOnly(d?.fecha || d?.Fecha);
      if (!dFecha) return;
      const id = Number(d?.empleadoID ?? d?.EmpleadoID ?? d?.idEmpleado ?? d?.IdEmpleado);
      if (Number.isFinite(id)) set.add(`id|${id}|${dFecha}`);
      const nombre = pickStr(d, [
        'EmpleadoNombre','empleadoNombre','NombreEmpleado','nombreEmpleado',
        'empleado','Empleado','nombre','Nombre'
      ]).trim().toLowerCase();
      if (nombre) set.add(`name|${nombre}|${dFecha}`);
    });
    return set;
  }, [Detalles]);

  const empleadoSel = watch('empleado');
  const fechaSel = watch('fecha');

  // Salario auto desde empleado
  useEffect(() => {
    if (!empleadoSel) return;
    const opt = empleadoOptions.find(o => o.value === Number(empleadoSel.value));
    const s = Number(opt?.salario);
    if (Number.isFinite(s) && s > 0) {
      setValue('salarioHora', s, { shouldDirty: true });
      clearErrors('salarioHora');
    } else {
      setValue('salarioHora', '', { shouldDirty: true });
    }
  }, [empleadoSel, empleadoOptions, setValue, clearErrors]);

  // Duplicado inmediato por nombre/ID + fecha
  const dupMsg = useMemo(() => {
    if (!empleadoSel || !fechaSel) return '';
    const d = dateOnly(fechaSel);
    if (!d) return '';
    const idKey = `id|${Number(empleadoSel.value)}|${d}`;
    const nameKey = `name|${String(empleadoSel.label || '').trim().toLowerCase()}|${d}`;
    return (dupIndex.has(idKey) || dupIndex.has(nameKey)) ? 'Ese empleado ya tiene un registro en esa fecha' : '';
  }, [empleadoSel, fechaSel, dupIndex]);

  useEffect(() => {
    if (dupMsg) setError('empleado', { type: 'manual', message: dupMsg });
    else clearErrors('empleado');
  }, [dupMsg, setError, clearErrors]);

  const onSubmit = async (values) => {
    const d = dateOnly(values.fecha);
    const preDup =
      dupIndex.has(`id|${Number(values.empleado.value)}|${d}`) ||
      dupIndex.has(`name|${String(values.empleado.label || '').trim().toLowerCase()}|${d}`);
    if (preDup) {
      setError('empleado', { type: 'manual', message: 'Ese empleado ya tiene un registro en esa fecha' });
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const usuario = getUsuarioOrThrow();
    const ts = new Date().toISOString();

    const payload = {
      usuario,
      quienIngreso: undefined,
      cuandoIngreso: ts,
      quienModifico: undefined,
      cuandoModifico: ts,

      planillaID: idPlan,
      empleadoID: values.empleado.value,
      presupuestoID: values.presupuesto.value,
      fecha: `${values.fecha}T00:00:00.000Z`,
      salarioHora: Number(Number(values.salarioHora).toFixed(2)),
      horasOrdinarias: Number(values.horasOrdinarias),
      horasExtras: Number(values.horasExtras),
      horasDobles: Number(values.horasDobles),
      detalle: 'Agregado desde formulario',
    };

    const ok = await insertarPlanillaDetalle(payload);
    if (ok) navigate(-1);
    else alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } };
  const isDuplicateNow = !!dupMsg;

  return (
    <motion.div className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="page-header" initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} aria-label="Volver"><ChevronLeft size={20} /></button>
          <div className="title-section"><h1 className="page-title"><Plus size={20} /> Agregar detalle</h1></div>
        </div>
        <div className="header-actions">
          <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} type="submit" form="form-detalle" className="btn-primary-modern" disabled={sendingApi || isSubmitting || isDuplicateNow}><Save size={16}/> Guardar</motion.button>
        </div>
      </motion.div>

      <motion.div className="filters-panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }}>
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
              <motion.div className="filter-field" variants={item}>
                <label>Fecha</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input className="modern-input" type="date" min={rango.ini} max={rango.fin} aria-invalid={!!errors.fecha} {...register('fecha')} />
                </div>
                {errors.fecha && <small className="hint" style={{ color:'#b91c1c' }}>{errors.fecha.message}</small>}
                {rango.ini && rango.fin && <small className="hint">Rango permitido: {rango.ini} – {rango.fin}</small>}
              </motion.div>

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

            <motion.div className="filter-actions" style={{ marginTop: 8 }} variants={item}>
              <div className="results-count" style={{ display:'flex', alignItems:'center', gap:8 }}>
                {!saveError && isValid && isDirty && !isDuplicateNow
                  ? (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ok-msg">
                      <CheckCircle2 size={16} style={{ color:'#16a34a' }}/> <span>Listo para guardar</span>
                    </motion.span>)
                  : (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <XCircle size={16} style={{ color:'#dc2626' }}/> <span>{isDuplicateNow ? 'El empleado ya tiene un registro en esa fecha' : 'Rellena todos los campos'}</span>
                    </motion.span>)}
              </div>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
}
