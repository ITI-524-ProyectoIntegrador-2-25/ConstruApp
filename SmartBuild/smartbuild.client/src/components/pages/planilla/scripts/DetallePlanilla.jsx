// src/components/pages/planilla/scripts/DetallePlanilla.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Edit, Plus, Download, Calendar, Search,
  User, Info, ChevronDown, ChevronUp, FileSpreadsheet, Building2, Clock,
  ChevronsLeft, ChevronLeft as LChevronLeft, ChevronRight, ChevronsRight
} from 'lucide-react';
import Select from 'react-select';
import { COLUMN_LABELS } from '../../../../constants/planilla';
import '../css/Planilla.css';
import { addDaysYMD } from '../../../../utils/date';

// hooks de datos
import { usePlanillas, usePlanillaDetalles, useActualizarPlanilla } from '../../../../hooks/Planilla';
import { useEmpleados } from '../../../../hooks/Empleados';
import { usePresupuestos } from '../../../../hooks/dashboard';

// ⬇️ importamos el CSS de la barra global para reutilizar estilos
import '../../../layout/pagination/GlobalPagination.css';

/* ======================= Helpers ======================= */
const ESTADOS = ['Pendiente', 'En proceso', 'Cerrada'];
const estadoOptions = ESTADOS.map(e => ({ value: e, label: e }));

const toISODateOnly = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};
const daysBetween = (a, b) => {
  const d1 = new Date(a), d2 = new Date(b);
  if (Number.isNaN(d1) || Number.isNaN(d2)) return null;
  return Math.round((d2 - d1) / 86400000) + 1;
};
const crc = (n) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 2 }).format(n || 0);
const getBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('cerr')) return 'bg-success';
  if (s.includes('proce')) return 'bg-primary';
  return 'bg-warning';
};

/* ======================= Mini barra local (mismo look) ======================= */
/** Barra de paginación local con el MISMO diseño que GlobalPagination */
function LocalPagination({ page, total, pageSize, onPage, onPageSize, labelText = 'elementos' }) {
  const isAll = pageSize === 'ALL';
  const ps = isAll ? Math.max(1, total) : Number(pageSize) || 10;
  const totalPages = Math.max(1, isAll ? 1 : Math.ceil((total || 0) / ps));
  const pg = Math.min(totalPages, Math.max(1, Number(page) || 1));
  const from = total ? (isAll ? 1 : (pg - 1) * ps + 1) : 0;
  const to = isAll ? total : Math.min(total, pg * ps);
  const progress = Math.round((pg / totalPages) * 100);
  const disableNav = isAll || totalPages <= 1;

  return (
    <div className="global-pagination" role="region" aria-label="Controles de paginación">
      <div className="gp-progress" aria-hidden="true">
        <div className="gp-progress__fill" style={{ width: `${progress}%` }}>
          <div className="gp-sheen" />
        </div>
      </div>

      <div className="global-pagination__left" aria-live="polite">
        Mostrando <strong>{from}</strong>–<strong>{to}</strong> de <strong>{total}</strong> {labelText}
      </div>

      <div className="global-pagination__right">
        <select
          className="page-size"
          value={pageSize}
          onChange={(e) => {
            const v = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
            onPageSize?.(v);
            onPage?.(1);
          }}
          aria-label="Tamaño de página"
        >
          <option value={10}>10 por página</option>
          <option value={25}>25 por página</option>
          <option value={50}>50 por página</option>
          <option value={100}>100 por página</option>
          <option value="ALL">Todas</option>
        </select>

        <div className="btn-group" role="group" aria-label="Navegación de páginas">
          <button className="nav-btn" onClick={() => onPage?.(1)} disabled={disableNav || pg <= 1} title="Primera">
            <ChevronsLeft size={16} />
          </button>
          <button className="nav-btn" onClick={() => onPage?.(pg - 1)} disabled={disableNav || pg <= 1} title="Anterior">
            <LChevronLeft size={16} />
          </button>
          <div className="page-pill" aria-live="polite">
            Página {pg} / {totalPages}
          </div>
          <button className="nav-btn" onClick={() => onPage?.(pg + 1)} disabled={disableNav || pg >= totalPages} title="Siguiente">
            <ChevronRight size={16} />
          </button>
          <button className="nav-btn" onClick={() => onPage?.(totalPages)} disabled={disableNav || pg >= totalPages} title="Última">
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================= Componente principal ======================= */
export default function DetallePlanilla() {
  const { idPlanilla } = useParams();
  const navigate = useNavigate();

  // Carga
  const { Planillas,  loading: loadingPlanillas }  = usePlanillas();
  const { Detalles,   loading: loadingDetalles }   = usePlanillaDetalles(idPlanilla);
  const { Empleados,  loading: loadingEmpleados }  = useEmpleados();
  const { presupuestos, loading: loadingPres }     = usePresupuestos();

  // Planilla actual
  const planillaActual = useMemo(
    () => (Array.isArray(Planillas) ? Planillas.find(p => String(p.idPlanilla) === String(idPlanilla)) : null),
    [Planillas, idPlanilla]
  );

  // Estado planilla
  const [planilla, setPlanilla] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedEmpleado, setExpandedEmpleado] = useState(null);
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', estado: ESTADOS[0] });
  const [error, setError] = useState('');
  const { actualizarPlanilla, loading: sending, error: updateError } = useActualizarPlanilla();

  useEffect(() => {
    if (planillaActual) {
      setPlanilla(planillaActual);
      setForm({
        nombre: planillaActual.nombre || '',
        fechaInicio: toISODateOnly(planillaActual.fechaInicio),
        fechaFin: toISODateOnly(planillaActual.fechaFin),
        estado: planillaActual.estado || ESTADOS[0],
      });
    }
  }, [planillaActual]);

  // Índices
  const empIndex = useMemo(() => {
    const m = new Map();
    (Array.isArray(Empleados) ? Empleados : []).forEach(e => m.set(e.idEmpleado, e));
    return m;
  }, [Empleados]);
  const presupuestoIndex = useMemo(() => {
    const m = new Map();
    (Array.isArray(presupuestos) ? presupuestos : []).forEach(p => m.set(p.idPresupuesto, p));
    return m;
  }, [presupuestos]);
  
  // Helper para mostrar nombre completo de empleado
  const toDisplayName = (e) => {
    if (!e) return '';
    const fromField = (e.nombreEmpleado || e.NombreEmpleado || '').trim?.() || '';
    if (fromField) return fromField;
    const parts = [e.nombre || e.Nombre, e.primerApellido || e.apellido || e.PrimerApellido || e.Apellido, e.segundoApellido || e.SegundoApellido].filter(Boolean);
    return parts.join(' ').replace(/\s+/g,' ').trim();
  };
const empleadoNameToId = useMemo(() => {
    const m = new Map();
    (Array.isArray(Empleados) ? Empleados : []).forEach(e => {
      const nombre = toDisplayName(e);
      m.set(nombre, e.idEmpleado);
    });
    return m;
  }, [Empleados]);

  // Enriquecer detalles
  const detalles = useMemo(() => {
    const base = Array.isArray(Detalles) ? Detalles : [];
    return base.map(d => {
      const emp = empIndex.get(d.empleadoID) || null;
      const empNombre = toDisplayName(emp) || d.empleadoID;
      const presupuestoNombre = presupuestoIndex.get(d.presupuestoID)?.descripcion ?? d.presupuestoID;
      const sh = Number(d.salarioHora ?? emp?.salarioHora ?? 0);
      const ho = Number(d.horasOrdinarias || 0);
      const he = Number(d.horasExtras || 0);
      const hd = Number(d.horasDobles || 0);
      const bruto = +(sh * ho + sh * 1.5 * he + sh * 2 * hd).toFixed(2);
      const seguro = +(bruto * 0.1067).toFixed(2);
      const neto = +(bruto - seguro).toFixed(2);
      return {
        ...d,
        empleadoNombre: empNombre,
        empleadoPuesto: emp?.puesto || '',
        empleadoSalarioHora: sh,
        presupuestoNombre,
        bruto, seguro, neto,
      };
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [Detalles, empIndex, presupuestoIndex]);

  // KPIs
  const resumen = useMemo(() => detalles.reduce((acc, d) => {
    acc.ho += Number(d.horasOrdinarias || 0);
    acc.he += Number(d.horasExtras || 0);
    acc.hd += Number(d.horasDobles || 0);
    acc.bruto += Number(d.bruto || 0);
    acc.seguro += Number(d.seguro || 0);
    acc.neto += Number(d.neto || 0);
    acc.registros += 1;
    if (d.empleadoNombre) acc.empleados.add(d.empleadoNombre);
    return acc;
  }, { ho:0, he:0, hd:0, bruto:0, seguro:0, neto:0, registros:0, empleados:new Set() }), [detalles]);

  // Top empleados (para la tabla superior)
  const topEmpleados = useMemo(() => {
    const hours = new Map(), money = new Map();
    detalles.forEach(d => {
      const key = d.empleadoNombre || String(d.empleadoID);
      const h = Number(d.horasOrdinarias||0) + Number(d.horasExtras||0) + Number(d.horasDobles||0);
      hours.set(key, (hours.get(key)||0) + h);
      money.set(key, {
        bruto: (money.get(key)?.bruto || 0) + (d.bruto || 0),
        seguro: (money.get(key)?.seguro || 0) + (d.seguro || 0),
        neto: (money.get(key)?.neto || 0) + (d.neto || 0),
      });
    });
    return [...hours.entries()]
      .map(([empleado, h]) => ({ empleado, horas:h, money:money.get(empleado)||{bruto:0,seguro:0,neto:0} }))
      .sort((a,b) => b.horas - a.horas);
  }, [detalles]);

  /* ======================= Filtros y resultados (tabla grande) ======================= */
  const [q, setQ] = useState('');
  const [fDate, setFDate] = useState('');
  const results = useMemo(() => {
    const k = q.trim().toLowerCase();
    const fd = fDate.trim();
    return detalles.filter(d => {
      const okTxt = !k || (d.empleadoNombre||'').toLowerCase().includes(k) || (d.presupuestoNombre||'').toLowerCase().includes(k);
      const okDate = !fd || toISODateOnly(d.fecha) === fd;
      return okTxt && okDate;
    });
  }, [detalles, q, fDate]);

  /* ======================= Paginación local ======================= */
  const [empPage, setEmpPage] = useState(1);
  const [empPageSize, setEmpPageSize] = useState(10);

  const [actPage, setActPage] = useState(1);
  const [actPageSize, setActPageSize] = useState(10);

  // Resets al cambiar colecciones/filtros
  useEffect(() => { setEmpPage(1); }, [topEmpleados.length, empPageSize]);
  useEffect(() => { setActPage(1); }, [results.length, actPageSize, q, fDate]);

  // Slice empleados (tabla superior)
  const empTotal = topEmpleados.length;
  const empSlice = useMemo(() => {
    const ps = empPageSize === 'ALL' ? empTotal : empPageSize;
    const start = (empPage - 1) * ps;
    return topEmpleados.slice(start, start + ps);
  }, [topEmpleados, empPage, empPageSize, empTotal]);

  // Slice actividades (10 por página) y AGRUPACIÓN por empleado SOLO del tramo visible
  const actTotal = results.length;
  const actSlice = useMemo(() => {
    const ps = actPageSize === 'ALL' ? actTotal : actPageSize;
    const start = (actPage - 1) * ps;
    return results.slice(start, start + ps);
  }, [results, actPage, actPageSize, actTotal]);

  const actSliceGrouped = useMemo(() => {
    const m = new Map();
    actSlice.forEach(r => {
      const id = r.empleadoID ?? r.empleadoNombre ?? '—';
      if (!m.has(id)) {
        m.set(id, {
          empleadoID: id,
          empleadoNombre: String(r.empleadoNombre ?? ''),
          items: [],
          tot: { ho:0, he:0, hd:0, bruto:0, seguro:0, neto:0 },
        });
      }
      const g = m.get(id);
      g.items.push(r);
      g.tot.ho += Number(r.horasOrdinarias||0);
      g.tot.he += Number(r.horasExtras||0);
      g.tot.hd += Number(r.horasDobles||0);
      g.tot.bruto += Number(r.bruto||0);
      g.tot.seguro += Number(r.seguro||0);
      g.tot.neto += Number(r.neto||0);
    });
    return [...m.values()].sort((a,b) => (a.empleadoNombre||'').localeCompare(b.empleadoNombre||''));
  }, [actSlice]);

  /* ======================= Estado compuesto ======================= */
  const loadingAny = !!(loadingPlanillas || loadingDetalles || loadingEmpleados || loadingPres);
  const isLoading = loadingAny || !planilla;
  const dur = planilla ? daysBetween(planilla.fechaInicio, planilla.fechaFin) : null;
  const empleadosCount = resumen.empleados.size;

  /* ======================= Handlers edición ======================= */
  const handleChange = e => { const { name, value } = e.target; if (name === 'fechaInicio') { const fin = value ? addDaysYMD(value, 14) : ''; setForm(f => ({ ...f, fechaInicio: value, fechaFin: fin })); } else if (name === 'fechaFin') { return; } else { setForm(f => ({ ...f, [name]: value })); } setError(''); };
  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    const diff = daysBetween(form.fechaInicio, form.fechaFin);
    if (diff == null || diff < 1) return setError('Rango de fechas inválido');
    if (diff > 15) return setError('La planilla no puede exceder 15 días.');

    const dup = (Array.isArray(Planillas) ? Planillas : []).some(
      p => String(p.idPlanilla) !== String(idPlanilla) &&
           String(p.nombre || '').trim().toLowerCase() === String(form.nombre || '').trim().toLowerCase()
    );
    if (dup) return setError('Ya existe una planilla con ese nombre.');

    try {
      const raw = localStorage.getItem('currentUser'); if (!raw) throw new Error('Usuario no autenticado');
      const user = JSON.parse(raw); const ahora = new Date().toISOString();
      const payload = {
        usuario: user.correo || user.usuario,
        quienIngreso: planilla.quienIngreso || '',
        cuandoIngreso: planilla.cuandoIngreso || '',
        quienModifico: user.correo || user.usuario,
        cuandoModifico: ahora,
        idPlanilla: planilla.idPlanilla,
        nombre: form.nombre, fechaInicio: form.fechaInicio, fechaFin: form.fechaFin, estado: form.estado,
      };
      const ok = await actualizarPlanilla(payload);
      if (!ok) throw new Error(updateError || 'No se pudo actualizar la planilla');
      setPlanilla(p => ({ ...p, ...form })); setIsEditing(false);
    } catch (err) { setError(err.message || 'No se pudo actualizar la planilla'); }
  };

  /* ======================= Render ======================= */
  if (isLoading) return <p className="detalle-loading">Cargando detalles…</p>;
  if (!planilla) return <p className="detalle-error">Planilla no encontrada.</p>;

  return (
    <>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet" />

      <div className="bg-light min-vh-100">
        <div className="container py-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12 d-flex align-items-center gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)} title="Volver">
                <ChevronLeft size={18} />
              </button>
              <h1 className="h3 mb-0">Planilla #{planilla.idPlanilla} — {planilla.nombre}</h1>
              <span className={`badge rounded-pill ${getBadge(planilla.estado)} ms-2`}>{planilla.estado}</span>
              <div className="ms-auto d-flex gap-2">
                <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setIsEditing(true)}>
                  <Edit size={16} /> Editar planilla
                </button>
                <button className="btn btn-success btn-sm d-flex align-items-center gap-2" onClick={() => navigate(`/dashboard/planilla/${idPlanilla}/AgregarDetalle`)}>
                  <Plus size={16} /> Agregar registro
                </button>
                <button
                  className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                  onClick={async () => {
                    const mod = await import('xlsx'); const XLSX = mod.default ?? mod;
                    const dPlan = daysBetween(planilla.fechaInicio, planilla.fechaFin);
                    const aoa = [[
                      'Planilla','Rango','Duración (días)','Horas ordinarias','Horas extra','Horas dobles','Total horas','Monto bruto','Seguro','Monto neto'
                    ],[
                      `#${planilla.idPlanilla} — ${planilla.nombre}`,
                      `${new Date(planilla.fechaInicio).toLocaleDateString()} al ${new Date(planilla.fechaFin).toLocaleDateString()}`,
                      dPlan ?? '', resumen.ho, resumen.he, resumen.hd,
                      (resumen.ho + resumen.he + resumen.hd).toFixed(2),
                      +(resumen.bruto||0), +(resumen.seguro||0), +(resumen.neto||0)
                    ]];
                    const wb = XLSX.utils.book_new(); const ws = XLSX.utils.aoa_to_sheet(aoa);
                    XLSX.utils.book_append_sheet(wb, ws, 'Resumen'); XLSX.writeFile(wb, `planilla_${planilla?.idPlanilla || 'resumen'}.xlsx`);
                  }}
                  title="Exportar resumen de planilla"
                >
                  <FileSpreadsheet size={16} /> Exportar XLSX
                </button>
              </div>
            </div>
          </div>

          {/* Editor */}
          {isEditing && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h2 className="h5 mb-3">Editar planilla</h2>
                    {(error || updateError) && <div className="alert alert-danger py-2">{error || updateError}</div>}
                    <form onSubmit={handleSubmit} className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Nombre</label>
                        <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required disabled={sending}/>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Fecha inicio</label>
                        <input type="date" className="form-control" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required disabled={sending}/>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Fecha fin</label>
                        <input type="date" className="form-control" name="fechaFin" value={form.fechaFin} readOnly  required disabled={sending}/>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Estado</label>
                        <Select options={estadoOptions} value={{ value: form.estado, label: form.estado }}
                                onChange={opt => setForm(f => ({ ...f, estado: opt.value }))} isSearchable={false}
                                classNamePrefix="react-select" isDisabled={sending} menuPortalTarget={document.body} menuPosition="fixed"/>
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? 'Guardando…' : 'Guardar cambios'}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setError(''); setForm({
                          nombre: planilla.nombre || '', fechaInicio: toISODateOnly(planilla.fechaInicio),
                          fechaFin: toISODateOnly(planilla.fechaFin), estado: planilla.estado || ESTADOS[0],
                        }); }} disabled={sending}>Cancelar</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cards resumen */}
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5 fw-semibold mb-3">Información</h2>
                  <div className="d-flex justify-content-between border-bottom py-2"><span className="text-muted">Inicio</span><span>{new Date(planilla.fechaInicio).toLocaleDateString()}</span></div>
                  <div className="d-flex justify-content-between border-bottom py-2"><span className="text-muted">Fin</span><span>{new Date(planilla.fechaFin).toLocaleDateString()}</span></div>
                  <div className="d-flex justify-content-between border-bottom py-2"><span className="text-muted">Duración</span><span>{dur ? `${dur} día${dur !== 1 ? 's' : ''}` : '—'}</span></div>
                  <div className="d-flex justify-content-between py-2"><span className="text-muted">Registros / Empleados</span><span>{resumen.registros} / {empleadosCount}</span></div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5 fw-semibold mb-3">Horas totales</h2>
                  <div className="row text-center g-3">
                    <div className="col-4"><div className="p-2 border rounded"><div className="text-muted small">Ordinarias</div><div className="h5 mb-0">{resumen.ho}</div></div></div>
                    <div className="col-4"><div className="p-2 border rounded"><div className="text-muted small">Extras</div><div className="h5 mb-0">{resumen.he}</div></div></div>
                    <div className="col-4"><div className="p-2 border rounded"><div className="text-muted small">Dobles</div><div className="h5 mb-0">{resumen.hd}</div></div></div>
                  </div>
                  <div className="mt-3 d-flex justify-content-between">
                    <span className="text-muted">Total de horas</span>
                    <span className="fw-semibold">{(resumen.ho + resumen.he + resumen.hd).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h5 fw-semibold mb-3">Financiamiento</h2>
                  <div className="d-flex justify-content-between border-bottom py-2"><span className="text-muted">Monto Bruto</span><span className="fw-semibold">{crc(resumen.bruto)}</span></div>
                  <div className="d-flex justify-content-between border-bottom py-2"><span className="text-muted">Seguro social</span><span className="fw-semibold">{crc(resumen.seguro)}</span></div>
                  <div className="d-flex justify-content-between py-2"><span className="text-muted">Monto Neto</span><span className="fw-bold text-success">{crc(resumen.neto)}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Empleados por horas + paginación (10 por página) */}
          {topEmpleados.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h2 className="h6 fw-semibold mb-3 d-flex align-items-center gap-2"><User size={16} /> Empleados por horas</h2>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0 align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Empleado</th>
                            <th className="text-end">Horas totales</th>
                            <th className="text-end">Monto Neto (₡)</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {empSlice.map((t, i) => {
                            const isOpen = expandedEmpleado === t.empleado;
                            return (
                              <React.Fragment key={`${t.empleado}-${i}`}>
                                <tr className="position-relative">
                                  <td>{t.empleado}</td>
                                  <td className="text-end">{t.horas.toFixed(2)}</td>
                                  <td className="text-end">{crc(t.money.neto)}</td>
                                  <td className="text-end">
                                    <button className="btn btn-outline-secondary btn-sm me-2 d-inline-flex align-items-center gap-1"
                                            onClick={() => setExpandedEmpleado(isOpen ? null : t.empleado)}>
                                      {isOpen ? (<><ChevronUp size={14}/> Ocultar</>) : (<><ChevronDown size={14}/> Ver</>)}
                                    </button>
                                    <Link to={`/dashboard/productividad/empleados/${empleadoNameToId.get(t.empleado) || ''}`}
                                          className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1">
                                      <User size={14}/> Perfil
                                    </Link>
                                  </td>
                                </tr>
                                {isOpen && (
                                  <tr className="bg-light">
                                    <td colSpan={4}>
                                      <div className="p-3 border rounded-3">
                                        <div className="d-flex align-items-center gap-2 mb-2"><Info size={16}/><strong>Resumen del empleado</strong></div>
                                        <div className="small text-muted">* Puedes extender aquí información adicional (proyectos, puesto, etc.).</div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                          {empSlice.length === 0 && (
                            <tr><td colSpan={4} className="text-center text-muted py-4">Sin empleados</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <LocalPagination
                      page={empPage}
                      total={empTotal}
                      pageSize={empPageSize}
                      labelText="empleados"
                      onPage={setEmpPage}
                      onPageSize={setEmpPageSize}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros + export de registros */}
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-6">
              <label className="form-label small">Buscar</label>
              <div className="input-group">
                <span className="input-group-text"><Search size={16} /></span>
                <input className="form-control" placeholder="Empleado o proyecto…" value={q} onChange={e => setQ(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Fecha</label>
              <div className="input-group">
                <span className="input-group-text"><Calendar size={16} /></span>
                <input type="date" className="form-control" value={fDate} onChange={e => setFDate(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button className="btn btn-outline-secondary w-50" onClick={() => { setQ(''); setFDate(''); }}>Limpiar</button>
              <button
                className="btn btn-outline-primary w-50 d-flex align-items-center justify-content-center gap-2"
                onClick={async () => {
                  const mod = await import('xlsx'); const XLSX = mod.default ?? mod;
                  const rows = detalles.map(d => ({
                    Fecha: d.fecha ? new Date(d.fecha).toLocaleDateString() : '',
                    Proyecto: d.presupuestoNombre,
                    Empleado: d.empleadoNombre,
                    'Salario/Hora': Number(d.salarioHora ?? d.empleadoSalarioHora ?? 0),
                    'Horas Ord.': Number(d.horasOrdinarias || 0),
                    'Horas Ext.': Number(d.horasExtras || 0),
                    'Horas Dobles': Number(d.horasDobles || 0),
                    'Salario Bruto': Number(d.bruto || 0),
                    Seguro: Number(d.seguro || 0),
                    'Salario Neto': Number(d.neto || 0),
                  }));
                  const wb = XLSX.utils.book_new(); const ws = XLSX.utils.json_to_sheet(rows);
                  XLSX.utils.book_append_sheet(wb, ws, 'Registros'); XLSX.writeFile(wb, `planilla_${planilla?.idPlanilla || 'registros'}.xlsx`);
                }}
                title="Exportar registros de detalle"
              >
                <Download size={16} /> XLSX
              </button>
            </div>
          </div>

          {/* Detalle de la planilla (agrupado por empleado) + paginación mini */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 fw-semibold mb-3">Detalle de la planilla</h2>
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle">
                  <thead className="table-light">
                    <tr>{Object.keys(COLUMN_LABELS).map(key => (<th key={key}>{COLUMN_LABELS[key]}</th>))}</tr>
                  </thead>
                  <tbody>
                    {actSliceGrouped.length === 0 && (
                      <tr><td colSpan={Object.keys(COLUMN_LABELS).length} className="text-center text-muted py-4">Sin registros</td></tr>
                    )}

                    {actSliceGrouped.map(group => (
                      <React.Fragment key={group.empleadoID}>
                        {/* Fila separadora por empleado (totales del TRAMO visible) */}
                        <tr className="table-secondary">
                          <td colSpan={Object.keys(COLUMN_LABELS).length} className="fw-semibold">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="d-flex align-items-center gap-2">
                                <User size={16} className="text-dark" />
                                {group.empleadoNombre || '—'}
                              </span>
                              <span className="d-flex gap-3">
                                <span><strong>Horas: </strong>{(group.tot.ho + group.tot.he + group.tot.hd).toFixed(2)}</span>
                                <span>Neto: <strong className="text-success">{crc(group.tot.neto)}</strong></span>
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Filas del empleado (sólo las del tramo paginado) */}
                        {group.items.map(item => (
                          <tr
                            key={item.idDetallePlanilla}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/dashboard/planilla/${idPlanilla}/${item.idDetallePlanilla}/EditarDetalle`)}
                          >
                            {Object.keys(COLUMN_LABELS).map((key, j) => {
                              if (key === 'fecha') {
                                return (
                                  <td key={j}>
                                    <span className="d-inline-flex align-items-center gap-2">
                                      <Calendar size={14} className="text-muted" />
                                      {item.fecha ? new Date(item.fecha).toLocaleDateString() : ''}
                                    </span>
                                  </td>
                                );
                              }
                              if (key === 'presupuestoNombre') {
                                return (
                                  <td key={j}>
                                    <span className="d-inline-flex align-items-center gap-2">
                                      <Building2 size={14} className="text-muted" />
                                      {item.presupuestoNombre}
                                    </span>
                                  </td>
                                );
                              }
                              if (key === 'empleadoNombre') {
                                return (
                                  <td key={j}>
                                    <span className="d-inline-flex align-items-center gap-2">
                                      <User size={14} className="text-dark" />
                                      {item.empleadoNombre}
                                    </span>
                                  </td>
                                );
                              }
                              if (key === 'salarioHora') {
                                return <td key={j} className="text-end">{crc(item.salarioHora ?? item.empleadoSalarioHora)}</td>;
                              }
                              if (['horasOrdinarias','horasExtras','horasDobles'].includes(key)) {
                                return (
                                  <td key={j} className="text-end">
                                    <span className="d-inline-flex align-items-center justify-content-end gap-1 w-100">
                                      <Clock size={13} className="text-muted" />
                                      {Number(item[key] || 0)}
                                    </span>
                                  </td>
                                );
                              }
                              if (key === 'bruto')  return <td key={j} className="text-end">{crc(item.bruto)}</td>;
                              if (key === 'seguro') return <td key={j} className="text-end">{crc(item.seguro)}</td>;
                              if (key === 'neto')   return <td key={j} className="text-end fw-semibold">{crc(item.neto)}</td>;
                              return <td key={j}>{item[key]}</td>;
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación local con diseño global */}
              <LocalPagination
                page={actPage}
                total={actTotal}
                pageSize={actPageSize}
                labelText="registros"
                onPage={setActPage}
                onPageSize={setActPageSize}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
