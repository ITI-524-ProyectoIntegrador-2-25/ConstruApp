// src/components/pages/planilla/DetallePlanilla.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './Planilla.css';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { http } from '../../../api/client';
import { getPlanilla, updatePlanilla } from '../../../api/Planilla';

const ESTADOS = ['Pendiente', 'En proceso', 'Cerrada'];

const COLUMN_LABELS = {
  fecha: 'Fecha',
  presupuestoNombre: 'Presupuesto',
  empleadoNombre: 'Empleado',
  salarioHora: 'Salario/Hora',
  horasOrdinarias: 'Horas Ordinarias',
  horasExtras: 'Horas Extras',
  horasDobles: 'Horas Dobles',
};

export default function DetallePlanilla() {
  const { idPlanilla } = useParams();
  const navigate = useNavigate();
  const [planilla, setPlanilla] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', estado: ESTADOS[0] });

  const estadoOptions = useMemo(() => ESTADOS.map(e => ({ value: e, label: e })), []);

  const getUsuario = () => {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      return u.correo || u.usuario || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!idPlanilla) {
      setError('No se proporcionó ID de planilla.');
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const usuario = getUsuario();
        if (!usuario) throw new Error('Usuario no autenticado');

        const [todas, detallesList, presupuestosData, empleadosData] = await Promise.all([
          getPlanilla(usuario),
          http.get('/PlanillaDetalleApi/GetPlanillaDetalle', { params: { usuario } }),
          http.get('/PresupuestoApi/GetPresupuestos', { params: { usuario } }),
          http.get('/EmpleadoApi/GetEmpleado', { params: { usuario } }),
        ]);

        const cab = Array.isArray(todas) ? todas.find(p => String(p.idPlanilla) === String(idPlanilla)) : null;
        if (!cab) throw new Error(`Planilla ${idPlanilla} no encontrada`);

        const filtrados = (Array.isArray(detallesList) ? detallesList : [])
          .filter(d => d.planillaID === Number(idPlanilla))
          .map(d => {
            const emp = empleadosData.find(e => e.idEmpleado === d.empleadoID);
            const empNombre = emp?.nombreEmpleado || (emp ? `${emp.nombre || ''} ${emp.apellido || ''}`.trim() : d.empleadoID);
            return {
              ...d,
              presupuestoNombre: presupuestosData.find(p => p.idPresupuesto === d.presupuestoID)?.descripcion || d.presupuestoID,
              empleadoNombre: empNombre,
            };
          });

        setPlanilla(cab);
        setDetalles(filtrados);
        setForm({
          nombre: cab.nombre || '',
          fechaInicio: cab.fechaInicio?.slice(0, 10) || '',
          fechaFin: cab.fechaFin?.slice(0, 10) || '',
          estado: cab.estado || ESTADOS[0],
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idPlanilla]);

  const resumen = useMemo(() => {
    const sum = detalles.reduce(
      (acc, d) => {
        const so = Number(d.horasOrdinarias || 0);
        const se = Number(d.horasExtras || 0);
        const sd = Number(d.horasDobles || 0);
        const sh = Number(d.salarioHora || 0);
        acc.ord += so;
        acc.ext += se;
        acc.dob += sd;
        acc.total += sh * so + sh * 1.5 * se + sh * 2 * sd;
        return acc;
      },
      { ord: 0, ext: 0, dob: 0, total: 0 }
    );
    return { horasOrdinarias: sum.ord, horasExtras: sum.ext, horasDobles: sum.dob, montoTotal: sum.total };
  }, [detalles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const raw = localStorage.getItem('currentUser');
    if (!raw) return;
    const user = JSON.parse(raw);
    const ahora = new Date().toISOString();
    const payload = {
      usuario: user.correo || user.usuario,
      quienIngreso: planilla.quienIngreso || '',
      cuandoIngreso: planilla.cuandoIngreso || '',
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idPlanilla: planilla.idPlanilla,
      nombre: form.nombre,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      estado: form.estado,
    };
    await updatePlanilla(payload);
    setIsEditing(false);
    setPlanilla((p) => ({ ...p, ...form }));
  };

  const handleCancel = () => {
    setForm({
      nombre: planilla.nombre,
      fechaInicio: planilla.fechaInicio?.slice(0, 10) || '',
      fechaFin: planilla.fechaFin?.slice(0, 10) || '',
      estado: planilla.estado,
    });
    setIsEditing(false);
  };

  const exportarXLSX = () => {
    const rows = detalles.map((d) => ({
      '#Código': d.idDetallePlanilla,
      Fecha: d.fecha ? new Date(d.fecha).toLocaleDateString() : '',
      Proyecto: d.presupuestoNombre,
      Empleado: d.empleadoNombre,
      'Salario/Hora': d.salarioHora,
      'Horas Ordinarias': d.horasOrdinarias,
      'Horas Extras': d.horasExtras,
      'Horas Dobles': d.horasDobles,
      'Total a Pagar': (
        Number(d.salarioHora || 0) * Number(d.horasOrdinarias || 0) +
        Number(d.salarioHora || 0) * 1.5 * Number(d.horasExtras || 0) +
        Number(d.salarioHora || 0) * 2 * Number(d.horasDobles || 0)
      ).toFixed(2),
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Planilla');
    XLSX.writeFile(wb, `planilla_${planilla?.idPlanilla || 'reporte'}.xlsx`);
  };

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>;
  if (error) return <p className="detalle-error">{error}</p>;
  if (!planilla) return null;

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h1>Planilla #{planilla.idPlanilla} - {planilla.nombre}</h1>
        {!isEditing && (
          <button className="btn-submit" style={{ marginLeft: 'auto' }} onClick={() => setIsEditing(true)}>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="form-dashboard" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha Inicio</label>
            <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Fecha Fin</label>
            <input name="fechaFin" type="date" value={form.fechaFin} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <Select options={estadoOptions} value={{ value: form.estado, label: form.estado }} onChange={(opt) => setForm((f) => ({ ...f, estado: opt.value }))} isSearchable={false} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-submit">Guardar cambios</button>
            <button type="button" className="btn-submit" style={{ background: '#ccc' }} onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      ) : (
        <div className="form-dashboard" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group"><label>Nombre</label><p className="value">{planilla.nombre}</p></div>
          <div className="form-group"><label>Fecha Inicio</label><p className="value">{new Date(planilla.fechaInicio).toLocaleDateString()}</p></div>
          <div className="form-group"><label>Fecha Fin</label><p className="value">{new Date(planilla.fechaFin).toLocaleDateString()}</p></div>
          <div className="form-group"><label>Estado</label><p className="value">{planilla.estado}</p></div>
          <div className="form-group"><label>Registro</label><p className="value">{planilla.cuandoIngreso ? new Date(String(planilla.cuandoIngreso).replace(' ', 'T')).toLocaleDateString() : ''}</p></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Resumen</label>
            <div className="value" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span>Horas Ordinarias: <strong>{resumen.horasOrdinarias}</strong></span>
              <span>Horas Extras: <strong>{resumen.horasExtras}</strong></span>
              <span>Horas Dobles: <strong>{resumen.horasDobles}</strong></span>
              <span>Monto Total ₡: <strong>{resumen.montoTotal.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      )}

      <div className="detalle-items table-responsive">
        <h3>Detalle de la planilla</h3>
        <table className="detalle-table">
          <thead>
            <tr>
              {Object.keys(COLUMN_LABELS).map((key) => (
                <th key={key}>{COLUMN_LABELS[key]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detalles.map((item) => (
              <tr key={item.idDetallePlanilla} onClick={() => navigate(`/dashboard/planilla/${idPlanilla}/${item.idDetallePlanilla}/EditarDetalle`)}>
                {Object.keys(COLUMN_LABELS).map((key, j) => {
                  let val = item[key];
                  if (key === 'fecha' && val) val = new Date(val).toLocaleDateString();
                  return <td key={j}>{val}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <button onClick={() => navigate(`/dashboard/planilla/${idPlanilla}/AgregarDetalle`)} className="btn-submit">
            Agregar registro
          </button>
          <button onClick={exportarXLSX} className="btn-submit">Exportar planilla</button>
        </div>
      </div>
    </div>
  );
}
