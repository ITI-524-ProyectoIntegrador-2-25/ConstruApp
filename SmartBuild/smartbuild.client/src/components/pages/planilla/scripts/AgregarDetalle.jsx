import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar, User, Building2, Clock, XCircle, CheckCircle2, Save } from 'lucide-react';
import Select from 'react-select';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import '../css/Planilla.css';
import { usePlanillas, usePlanillaDetalles, useInsertarPlanillaDetalle } from '../../../../hooks/Planilla';
import { useEmpleados } from '../../../../hooks/Empleados';
import { usePresupuestos } from '../../../../hooks/dashboard';
import { dateOnly, isHalfStep } from '../../../../utils/date';
import { getUsuarioOrThrow } from '../../../../utils/user';

const half = (v) => Number.isFinite(Number(v)) && Math.round(Number(v) * 2) === Number(v) * 2;

const mapEmpleadoOptions = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map((e) => {
      const id = e.idEmpleado ?? e.IdEmpleado ?? e.empleadoID ?? e.EmpleadoID;
      const label = e.nombre ?? e.Nombre ?? e.empleadoNombre ?? e.EmpleadoNombre ?? `Empleado ${id ?? ''}`;
      const n = Number(id);
      return Number.isFinite(n) ? { value: n, label } : null;
    }).filter(Boolean);

const mapPresupuestoOptions = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map((p) => {
      const id = p.idPresupuesto ?? p.IdPresupuesto ?? p.presupuestoID ?? p.PresupuestoID;
      const label = p.nombre ?? p.Nombre ?? p.descripcion ?? p.Descripcion ?? `Presupuesto ${id ?? ''}`;
      const n = Number(id);
      return Number.isFinite(n) ? { value: n, label } : null;
    }).filter(Boolean);

export default function AgregarDetalle() {
  const { idPlanilla } = useParams();
  const idPlan = Number(idPlanilla);
  const navigate = useNavigate();

  const { Planillas } = usePlanillas();
  const { Detalles } = usePlanillaDetalles(idPlan); // valida duplicados de esta planilla
  const { insertarPlanillaDetalle, loading: sendingApi, error: saveError } = useInsertarPlanillaDetalle();
  const { Empleados } = useEmpleados();
  const { Presupuestos } = usePresupuestos();

  const plan = useMemo(
    () => (Array.isArray(Planillas) ? Planillas.find(p => Number(p?.idPlanilla ?? p?.IdPlanilla) === idPlan) : null),
    [Planillas, idPlan]
  );
  const rango = useMemo(() => ({
    ini: plan?.fechaInicio ? dateOnly(plan.fechaInicio) : '',
    fin: plan?.fechaFin ? dateOnly(plan.fechaFin) : '',
  }), [plan]);

  const schema = useMemo(() => z.object({
    fecha: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Fecha inválida')
      .refine(v => !!rango.ini && !!rango.fin && v >= rango.ini && v <= rango.fin, `La fecha debe estar entre ${rango.ini} y ${rango.fin}`),
    empleado: z.object({ value: z.number(), label: z.string() }, { required_error: 'Colaborador requerido' }),
    presupuesto: z.object({ value: z.number(), label: z.string() }, { required_error: 'Presupuesto requerido' }),
    salarioHora: z.preprocess(v => Number(v), z.number().positive('Salario debe ser > 0')),
    horasOrdinarias: z.preprocess(v => Number(v), z.number().refine(half, 'Debe ser múltiplo de 0.5').min(0.5).max(24)),
    horasExtras: z.preprocess(v => Number(v), z.number().refine(half, 'Debe ser múltiplo de 0.5').min(0).max(24)).default(0),
    horasDobles: z.preprocess(v => Number(v), z.number().refine(half, 'Debe ser múltiplo de 0.5').min(0).max(24)).default(0),
  }).superRefine((val, ctx) => {
    const total = Number(val.horasOrdinarias || 0) + Number(val.horasExtras || 0) + Number(val.horasDobles || 0);
    if (total > 24) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La suma de horas no puede exceder 24', path: ['horasOrdinarias'] });
    const lista = Array.isArray(Detalles) ? Detalles : [];
    const found = lista.some(d =>
      Number(d?.planillaID ?? d?.PlanillaID) === idPlan &&
      dateOnly(d?.fecha) === val.fecha &&
      Number(d?.idEmpleado ?? d?.IdEmpleado) === val.empleado.value
    );
    if (found) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ya existe un registro de este empleado en esa fecha para esta planilla', path: ['empleado'] });
  }), [Detalles, rango.ini, rango.fin, idPlan]);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
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
    }
  });

  const empleadoOptions = useMemo(() => mapEmpleadoOptions(Empleados), [Empleados]);
  const presupuestoOptions = useMemo(() => mapPresupuestoOptions(Presupuestos), [Presupuestos]);

  const onSubmit = async (values) => {
    const usuario = getUsuarioOrThrow();
    const ts = new Date().toISOString();
    const payload = {
      PlanillaID: idPlan, idPlanilla: idPlan,
      Fecha: new Date(`${values.fecha}T00:00:00Z`).toISOString(),
      fecha: new Date(`${values.fecha}T00:00:00Z`).toISOString(),
      IdEmpleado: values.empleado.value,  idEmpleado: values.empleado.value,
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
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back-modern" onClick={() => navigate(-1)} aria-label="Volver"><ChevronLeft size={20} /></button>
          <div className="title-section"><h1 className="page-title"><Plus size={20}/> Agregar detalle</h1></div>
        </div>
        <div className="header-actions">
          <button type="submit" form="form-detalle" className="btn-primary-modern" disabled={sendingApi || isSubmitting}><Save size={16}/> Guardar</button>
        </div>
      </div>

      <div className="filters-panel">
        <div className="filters-content">
          {saveError && (
            <div className="alert" role="alert" style={{ background:'#fee2e2', border:'1px solid #fecaca', color:'#991b1b',
              padding:'0.75rem 1rem', borderRadius:12, display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
              <XCircle size={18} /><span>{saveError}</span>
            </div>
          )}

          <form id="form-detalle" onSubmit={handleSubmit(onSubmit)}>
            <div className="filter-row">
              <div className="filter-field">
                <label>Fecha</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input className="modern-input" type="date" aria-invalid={!!errors.fecha} {...register('fecha')} />
                </div>
                {errors.fecha && <small className="hint" style={{ color:'#b91c1c' }}>{errors.fecha.message}</small>}
                {rango.ini && rango.fin && <small className="hint">Rango permitido: {rango.ini} – {rango.fin}</small>}
              </div>

              <div className="filter-field">
                <label>Colaborador</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <Controller control={control} name="empleado"
                    render={({ field }) => (
                      <Select {...field}
                        options={empleadoOptions}
                        placeholder="Selecciona colaborador"
                        menuPortalTarget={document.body}
                        classNamePrefix="react-select"
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      />
                    )}
                  />
                </div>
                {errors.empleado && <small className="hint" style={{ color:'#b91c1c' }}>{errors.empleado.message}</small>}
              </div>

              <div className="filter-field">
                <label>Presupuesto</label>
                <div className="input-with-icon">
                  <Building2 size={16} className="input-icon" />
                  <Controller control={control} name="presupuesto"
                    render={({ field }) => (
                      <Select {...field}
                        options={presupuestoOptions}
                        placeholder="Selecciona presupuesto"
                        menuPortalTarget={document.body}
                        classNamePrefix="react-select"
                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      />
                    )}
                  />
                </div>
                {errors.presupuesto && <small className="hint" style={{ color:'#b91c1c' }}>{errors.presupuesto.message}</small>}
              </div>

              <div className="filter-field">
                <label>Salario/Hora</label>
                <div className="input-with-icon">
                  <Clock size={16} className="input-icon" />
                  <input className="modern-input" type="number" step="0.01" min="0" aria-invalid={!!errors.salarioHora} {...register('salarioHora')} />
                </div>
                {errors.salarioHora && <small className="hint" style={{ color:'#b91c1c' }}>{errors.salarioHora.message}</small>}
              </div>

              <div className="filter-field">
                <label>Horas Ordinarias</label>
                <input className="modern-input" type="number" step="0.5" min="0.5" max="24" aria-invalid={!!errors.horasOrdinarias} {...register('horasOrdinarias')} />
                {errors.horasOrdinarias && <small className="hint" style={{ color:'#b91c1c' }}>{errors.horasOrdinarias.message}</small>}
              </div>

              <div className="filter-field">
                <label>Horas Extras</label>
                <input className="modern-input" type="number" step="0.5" min="0" max="24" aria-invalid={!!errors.horasExtras} {...register('horasExtras')} />
                {errors.horasExtras && <small className="hint" style={{ color:'#b91c1c' }}>{errors.horasExtras.message}</small>}
              </div>

              <div className="filter-field">
                <label>Horas Dobles</label>
                <input className="modern-input" type="number" step="0.5" min="0" max="24" aria-invalid={!!errors.horasDobles} {...register('horasDobles')} />
                {errors.horasDobles && <small className="hint" style={{ color:'#b91c1c' }}>{errors.horasDobles.message}</small>}
              </div>
            </div>

            <div className="filter-actions" style={{ marginTop: 8 }}>
              <div className="results-count" style={{ display:'flex', alignItems:'center', gap:8 }}>
                {Object.keys(errors).length ? (<><XCircle size={16} style={{ color:'#dc2626' }} /><span>Revisá los campos</span></>)
                  : (<><CheckCircle2 size={16} style={{ color:'#16a34a' }} /><span>Listo para guardar</span></>)}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
