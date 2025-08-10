// src/components/pages/dashboard/DetalleDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { Edit, Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormDashboard.css'

// Hook
import { usePresupuestoDetalle, useInsertarActualizarPresupuesto } from '../../../hooks/dashboard';
import { useClientes } from '../../../hooks/cliente'
import { useActividades } from '../../../hooks/Actividades'
import { useGastosAdicionales } from '../../../hooks/gastosAdicionales'
// import { label } from 'framer-motion/client'

export default function DetalleDashboard() {
  const { idPresupuesto } = useParams()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    cliente: { },
    fechaInicio: '',
    fechaFin: '',
    fechaFinReal: '',
    penalizacion: false,
    montoPenalizacion: 0,
    descripcion: '',
    materiaPrimaCotizada: 0,
    manoObraCotizada: 0,
    materiaPrimaCostoReal: 0,
    manoObraCostoReal: 0,
    subContratoCostoReal: 0,
    otrosGastos: 0,
    estado: ''
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Función para obtener la clase del badge según el estado
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completado':
      case 'terminado':
      case 'pagado':
        return 'bg-success';
      case 'en progreso':
      case 'pendiente':
        return 'bg-warning';
      case 'cancelado':
      case 'retrasado':
        return 'bg-danger';
      default:
        return 'bg-primary';
    }
  };

  const dateDuration = (fecha1, fecha2) => {
    const f1 = new Date(fecha1);
    const f2 = new Date(fecha2);

    // Calcula meses
    let meses = (f2.getFullYear() - f1.getFullYear()) * 12;
    meses += f2.getMonth() - f1.getMonth();

    // Ajuste si los días del mes afectan la diferencia
    if (f2.getDate() < f1.getDate()) {
      meses--;
    }

    // Si es menos de un mes, calculamos días
    if (meses < 1) {
      const diffTime = Math.abs(f2 - f1);
      const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return `${dias} día${dias !== 1 ? 's' : ''}`;
    }

    return `${meses} mes${meses !== 1 ? 'es' : ''}`;
  }

  const { presupuestoDetalle, loading, error } = usePresupuestoDetalle(idPresupuesto)
  const { clientes, loadingClients, errorClients } = useClientes()
  const { Actividades, loadingActividades, errorActividades } = useActividades()
  const { gastosAdicionales, setGastosAdicionales, loadingGastosAdicionales, errorGastosAdicionales } = useGastosAdicionales()
  const { insertarActualizarPresupuesto, loadingUpdate, error: errorGuardar } = useInsertarActualizarPresupuesto();

  const detalleCliente = useMemo(() => {
    if (clientes?.length > 0 && presupuestoDetalle) {
      return clientes.filter(c => c.idCliente === presupuestoDetalle.clienteID)[0];
    }
    return [];
  }, [clientes, presupuestoDetalle]);

  const listaActividades = useMemo(() => {
    if (Actividades?.length > 0 && presupuestoDetalle) {
      return Actividades.filter(a => a.presupuestoID === presupuestoDetalle.idPresupuesto && a.actividadID === 0);
    }
    return [];
  }, [Actividades, presupuestoDetalle]);

  const costBreakdown = useMemo(() => {
    if (presupuestoDetalle) {
      var result = [
        {
            category: "Mano de Obra",
            estimado: presupuestoDetalle.manoObraCotizada || 0,
            real: presupuestoDetalle.manoObraCostoReal || 0,
            variance: (presupuestoDetalle.manoObraCostoReal || 0) - (presupuestoDetalle.manoObraCotizada || 0)
          },
          {
            category: "Materia Prima",
            estimado: presupuestoDetalle.materiaPrimaCotizada || 0,
            real: presupuestoDetalle.materiaPrimaCostoReal || 0,
            variance: (presupuestoDetalle.materiaPrimaCostoReal || 0) - (presupuestoDetalle.materiaPrimaCostoReal || 0)
          },
          {
            category: "Subcontratos",
            estimado: presupuestoDetalle.subContratoCotizado || 0,
            real: presupuestoDetalle.subContratoCostoReal || 0,
            variance: (presupuestoDetalle.subContratoCostoReal || 0) - (presupuestoDetalle.subContratoCotizado || 0)
          }
      ]

      return result
    }
    return [];
  }, [presupuestoDetalle])

  // Estados para gastos adicionales
  const [showFormGastos, setShowFormGastos] = useState(false);
  const listaGastosAdicionales = useMemo(() => {
    if (gastosAdicionales?.length > 0 && presupuestoDetalle) {
      return gastosAdicionales.filter(g => g.presupuestoID === presupuestoDetalle.idPresupuesto);
    }
    return [];
  }, [gastosAdicionales, presupuestoDetalle])

  const [nuevoGasto, setNuevoGasto] = useState({
    date: '',
    description: '',
    amount: '',
    paymentStatus: 'Pending'
  });

  // Función para agregar nuevo gasto
  const handleAgregarGasto = (e) => {
    e.preventDefault();
    if (nuevoGasto.date && nuevoGasto.description && nuevoGasto.amount) {
      const gasto = {
        date: nuevoGasto.date,
        description: nuevoGasto.description,
        amount: parseFloat(nuevoGasto.amount),
        paymentStatus: nuevoGasto.paymentStatus
      };
      setGastosAdicionales(prev => [...prev, gasto]);
      setNuevoGasto({
        date: '',
        description: '',
        amount: '',
        paymentStatus: 'Pending'
      });
      setShowFormGastos(false);
    }
  };

  // Función para eliminar gasto
  const handleEliminarGasto = (id) => {
    setGastosAdicionales(listaGastosAdicionales.filter(gasto => gasto.idGasto !== id));
  };

  // Función para cambiar el estado de pago
  const handleActualizarGasto = (id, nuevoEstado) => {
    setGastosAdicionales(listaGastosAdicionales.map(gasto => 
      gasto.idGasto === id ? { ...gasto, estadoPago: nuevoEstado } : gasto
    ));
  };

  useEffect(() => {
    if (presupuestoDetalle) {
      presupuestoDetalle.fechaInicio = presupuestoDetalle.fechaInicio?.slice(0, 10) || ''
      presupuestoDetalle.fechaFin = presupuestoDetalle.fechaFin?.slice(0, 10) || ''
      presupuestoDetalle.estado = presupuestoDetalle.estado ?? 'Sin iniciar'
      presupuestoDetalle.duracion = dateDuration(presupuestoDetalle.fechaFin, presupuestoDetalle.fechaInicio)
      presupuestoDetalle.costoEstimado = (presupuestoDetalle.materiaPrimaCotizada || 0) + (presupuestoDetalle.manoObraCotizada || 0) + (presupuestoDetalle.subContratoCotizado || 0)
      presupuestoDetalle.costoActual = (presupuestoDetalle.materiaPrimaCostoReal || 0) + (presupuestoDetalle.manoObraCostoReal || 0) + (presupuestoDetalle.subContratoCostoReal || 0) + (presupuestoDetalle.otrosGastos || 0)
      presupuestoDetalle.gananciaPerdida = (presupuestoDetalle.montoProyecto || 0) - presupuestoDetalle.costoActual

      setForm({
        cliente: { value: presupuestoDetalle.clienteID, label: presupuestoDetalle.nombreCliente },
        fechaInicio: presupuestoDetalle.fechaInicio?.slice(0, 10) || '',
        fechaFin: presupuestoDetalle.fechaFin?.slice(0, 10) || '',
        fechaFinReal: presupuestoDetalle.fechaFinReal?.slice(0, 10) || '',
        penalizacion: presupuestoDetalle.penalizacion || false,
        montoPenalizacion: presupuestoDetalle.montoPenalizacion || 0,
        descripcion: presupuestoDetalle.descripcion || '',
        materiaPrimaCotizada: presupuestoDetalle.materiaPrimaCotizada || 0,
        manoObraCotizada: presupuestoDetalle.manoObraCotizada || 0,
        materiaPrimaCostoReal: presupuestoDetalle.materiaPrimaCostoReal || 0,
        manoObraCostoReal: presupuestoDetalle.manoObraCostoReal || 0,
        subContratoCostoReal: presupuestoDetalle.subContratoCostoReal || 0,
        otrosGastos: presupuestoDetalle.otrosGastos || 0,
        estado: presupuestoDetalle.estado ?? 'Sin iniciar'
      })
    }
  }, [presupuestoDetalle])

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (loadingClients) return <p className="detalle-loading">Cargando detalles…</p>
  if (errorClients) return <p className="detalle-error">{error}</p>
  if (!presupuestoDetalle) return <p className="detalle-error">No se encontró el detalle del presupuesto.</p>
  if (!clientes) return <p className="detalle-error">No se encontraron clientes.</p>

  const optionsClientes = 
    clientes.map(c => ({ value: c.idCliente, label: c.razonSocial }));
  
  const handleChange = e => {
    const { name, type, value, checked } = e.target
    setForm(f => ({ ...f, [name]: type==='checkbox'?checked:value }))
  }
  const handleSelect = sel => setForm(f=>({...f, cliente: sel}))
  
  const handleSubmit = async e => {
    e.preventDefault()
    const usr = localStorage.getItem('currentUser')
    if(!usr) return
    const user = JSON.parse(usr)
    const ahora = new Date().toISOString()
    const payload = {
      usuario: user.correo || user.usuario,
      quienIngreso: presupuestoDetalle.quienIngreso,
      cuandoIngreso: presupuestoDetalle.cuandoIngreso,
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idPresupuesto: presupuestoDetalle.idPresupuesto,
      clienteID: form.cliente.value,
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      fechaFin: form.fechaFin?new Date(form.fechaFin).toISOString():null,
      fechaFinReal: form.fechaFinReal?new Date(form.fechaFinReal).toISOString():null,
      penalizacion: form.penalizacion,
      montoPenalizacion: Number(form.montoPenalizacion),
      descripcion: form.descripcion,
      materiaPrimaCotizada: Number(form.materiaPrimaCotizada),
      manoObraCotizada: Number(form.manoObraCotizada),
      materiaPrimaCostoReal: Number(form.materiaPrimaCostoReal),
      manoObraCostoReal: Number(form.manoObraCostoReal),
      subContratoCostoReal: Number(form.subContratoCostoReal),
      otrosGastos: Number(form.otrosGastos)
    }
    
    const success = await insertarActualizarPresupuesto(payload);
    if(loadingUpdate) return <p className="detalle-loading">Guardando presupuesto…</p>
    if (!success) {
      throw new Error(errorGuardar || 'No se pudo insertar el proyecto');
    }

    setIsEditing(false)
  }


  // Array de campos monetarios
  // const camposMonetarios = [
  //   { key: 'montoPenalizacion', label: 'Monto penalización:', condicional: presupuestoDetalle.penalizacion },
  //   { key: 'materiaPrimaCotizada', label: 'Materia prima (cotizada):' },
  //   { key: 'manoObraCotizada', label: 'Mano de obra (cotizada):' },
  //   { key: 'materiaPrimaCostoReal', label: 'Materia prima (real):' },
  //   { key: 'manoObraCostoReal', label: 'Mano de obra (real):' },
  //   { key: 'subContratoCostoReal', label: 'Subcontrato (real):' },
  //   { key: 'otrosGastos', label: 'Otros gastos:' }
  // ]

  // return (
  //   <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
  //     <div className="form-dashboard-header">
  //       <button className="back-btn" onClick={()=>navigate(-1)}>
  //         <ChevronLeft size={20}/>
  //       </button>
  //       <h1>Detalle del presupuesto #{presupuestoDetalle.idPresupuesto} - {presupuestoDetalle.descripcion}</h1>
  //       {!isEditing && (
  //         <button className="btn-submit" style={{ marginLeft: 'auto' }} onClick={()=> setIsEditing(true)}>
  //           Editar Proyecto
  //         </button>
  //       )}
  //     </div>

  //     {isEditing ? (
  //       <form className="form-dashboard" onSubmit={handleSubmit} style={{ display:'grid',gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'}}>
  //         <div className="form-group">
  //           <label>Cliente</label>
  //           <Select
  //             options={optionsClientes}
  //             value={form.cliente}
  //             onChange={handleSelect}
  //             className="react-select-container"
  //             classNamePrefix="react-select"
  //           />
  //         </div>
  //         <div className="form-group">
  //           <label>Fecha Inicio</label>
  //           <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required />
  //         </div>
  //         <div className="form-group">
  //           <label>Fecha Fin Estimada</label>
  //           <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} />
  //         </div>
  //         <div className="form-group">
  //           <label>Fecha Fin Real</label>
  //           <input type="date" name="fechaFinReal" value={form.fechaFinReal} onChange={handleChange} />
  //         </div>
  //         <div className="form-group switch-group">
  //           <label>
  //             <input type="checkbox" name="penalizacion" checked={form.penalizacion} onChange={handleChange}/> Penalización
  //           </label>
  //         </div>
  //         {form.penalizacion && (
  //           <div className="form-group">
  //             <label>Monto Penalización</label>
  //             <input type="number" name="montoPenalizacion" value={form.montoPenalizacion} onChange={handleChange} />
  //           </div>
  //         )}
  //         <div className="form-group">
  //           <label>Descripción</label>
  //           <textarea name="descripcion" rows={3} value={form.descripcion} onChange={handleChange} />
  //         </div>
  //         {['materiaPrimaCotizada','manoObraCotizada','materiaPrimaCostoReal','manoObraCostoReal','subContratoCostoReal','otrosGastos'].map(key=> (
  //           <div className="form-group" key={key}>
  //             <label>{key.replace(/([A-Z])/g,' $1')}</label>
  //             <input type="number" name={key} value={form[key]} onChange={handleChange}/>
  //           </div>
  //         ))}
  //         <div style={{gridColumn:'1 / -1',display:'flex',gap:'1rem',marginTop:'1rem'}}>
  //           <button type="submit" className="btn-submit">Guardar cambios</button>
  //           <button type="button" className="btn-submit" style={{background:'#ccc'}} onClick={()=> setIsEditing(false) }>Cancelar</button>
  //         </div>
  //       </form>
  //     ) : (
  //       <div className="form-dashboard" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem' }}>
  //         <div className="form-group"><label>Cliente</label><p className="value">{presupuestoDetalle.nombreCliente}</p></div>
  //         <div className="form-group"><label>Fecha Inicio</label><p className="value">{new Date(presupuestoDetalle.fechaInicio).toLocaleDateString()}</p></div>
  //         <div className="form-group"><label>Fecha Fin Estimada</label><p className="value">{new Date(presupuestoDetalle.fechaFin).toLocaleDateString()}</p></div>
  //         <div className="form-group"><label>Fecha Fin Real</label><p className="value">{presupuestoDetalle.fechaFinReal?new Date(presupuestoDetalle.fechaFinReal).toLocaleDateString():'N/A'}</p></div>
  //         <div className="form-group"><label>Penalización</label><p className="value">{presupuestoDetalle.penalizacion?'Sí':'No'}</p></div>
  //         {presupuestoDetalle.penalizacion && <div className="form-group"><label>Monto Penalización</label><p className="value">₡{presupuestoDetalle.montoPenalizacion}</p></div>}
  //         {['materiaPrimaCotizada','manoObraCotizada','materiaPrimaCostoReal','manoObraCostoReal','subContratoCostoReal','otrosGastos'].map(key=>(
  //           <div className="form-group" key={key}><label>{key.replace(/([A-Z])/g,' $1')}</label><p className="value">₡{presupuestoDetalle[key]}</p></div>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // )

  return (
    <>
      {/* Bootstrap CSS CDN */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div className="bg-light min-vh-100">
        <div className="container py-5">
          {/* Header */}
          <div className="row mb-5">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <h1 className="display-4 fw-bold text-dark mb-0">Detalle del proyecto</h1>
              <button className="btn btn-primary d-flex align-items-center gap-2">
                <Edit size={16} />
                Editar Proyecto
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="row mb-5 g-4">
            {/* Project Timeline */}
            <div className="col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="card-title h4 fw-semibold mb-4">Información del proyecto</h2>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Nombre</span>
                        <span className="fw-medium">{presupuestoDetalle.descripcion}</span>
                        <span className={`${getStatusBadgeClass(presupuestoDetalle.estado)} badge rounded-pill`}>
                          {presupuestoDetalle.estado}
                        </span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Fecha de inicio proyectada</span>
                        <span className="fw-medium">{presupuestoDetalle.fechaInicio}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Fecha fin proyectada</span>
                        <span className="fw-medium">{presupuestoDetalle.fechaFin}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Duración</span>
                        <span className="fw-medium">{presupuestoDetalle.duracion}</span>
                      </div>
                    </div>
                    {presupuestoDetalle.penalizacion && (
                      <div className="col-12">
                        <div className="d-flex justify-content-between pb-2">
                          <span className="text-muted">Penalización</span>
                          <span className="fw-medium">{presupuestoDetalle.periodoPenalizacion}</span>
                        </div>
                        <div className="d-flex justify-content-between border-bottom pb-2">
                          <span className="text-muted">Monto</span>
                          <span className="fw-medium">{formatCurrency(presupuestoDetalle.montoPenalizacion)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h2 className="card-title h4 fw-semibold mb-4">Detalle del cliente</h2>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Nombre</span>
                        <span className="fw-medium">{presupuestoDetalle.nombreCliente}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Contacto</span>
                        <span className="fw-medium">{detalleCliente.nombreContacto}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between border-bottom pb-2">
                        <span className="text-muted">Correo</span>
                        <span className="fw-medium text-primary">{detalleCliente.correoContacto}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Teléfono</span>
                        <span className="fw-medium">{detalleCliente.telefonoContacto}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Activities */}
            <div className="col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h2 className="card-title h4 fw-semibold mb-4">Actividades</h2>
                  <div className="flex-grow-1" style={{maxHeight: '400px', overflowY: 'auto'}}>
                    {listaActividades.map((activity) => (
                      <div key={activity.idActividad} className="border rounded p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-semibold mb-1 text-truncate" style={{maxWidth: '70%'}}>
                            {activity.descripcion}
                          </h6>
                          <span
                            style={{ position: 'relative' }}
                            className={`${getStatusBadgeClass(activity.estado)} badge small`}
                          >
                            {activity.estado}
                          </span>
                        </div>
                        
                        <div className="small text-muted">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Fecha</span>
                            <span>{activity.fechaInicioProyectada.slice(0, 10)} hasta {activity.fechaFinProyectada.slice(0, 10)}</span>
                          </div>
                          {activity.fechaInicioReal && (
                            <div className="d-flex justify-content-between">
                              <span>Real</span>
                              <span>
                                {activity.fechaInicioReal.slice(0, 10)} hasta {activity.fechaFinReal.slice(0, 10) || 'En progreso'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="card-title h4 fw-semibold mb-4">Información financiera</h2>
                  <div className="row g-4 text-center">
                    <div className="col-md-3 col-sm-6">
                      <div className="p-3">
                        <p className="text-muted mb-2">Costo estimado</p>
                        <h3 className="display-6 fw-bold text-dark mb-0">
                          {formatCurrency(presupuestoDetalle.costoEstimado)}
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="p-3">
                        <p className="text-muted mb-2">Costo actual</p>
                        <h3 className="display-6 fw-bold text-dark mb-0">
                          {formatCurrency(presupuestoDetalle.costoActual)}
                        </h3>
                        <span className="text-muted small">vs Estimado</span>
                        <span className="small fw-medium text-danger">
                          <span className="ms-1">
                            {((presupuestoDetalle.costoActual / presupuestoDetalle.costoEstimado) * 100).toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="p-3">
                        <p className="text-muted mb-2">Monto proyecto</p>
                        <h3 className="display-6 fw-bold text-dark mb-0">
                          {formatCurrency(presupuestoDetalle.montoProyecto)}
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="p-3">
                        <p className="text-muted mb-2">Ganancia</p>
                        <h3 className="display-6 fw-bold text-success mb-0">
                          {formatCurrency(presupuestoDetalle.gananciaPerdida)}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown Chart */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="card-title h4 fw-semibold mb-4">Comparación de costos</h2>
                  <div className="row">
                    {/* Chart */}
                    <div className="col-lg-8">
                      <div style={{width: '100%', height: '350px'}}>
                        <ResponsiveContainer>
                          <BarChart
                            data={costBreakdown}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            barCategoryGap="20%"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                            <XAxis 
                              dataKey="category" 
                              tick={{ fontSize: 12 }}
                              stroke="#6c757d"
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              stroke="#6c757d"
                              tickFormatter={(value) => `${value.toLocaleString()}`}
                            />
                            <Tooltip 
                              formatter={(value, name) => [
                                `${value.toLocaleString()}`, 
                                name === 'Estimado' ? 'Estimado' : 'Real'
                              ]}
                              labelStyle={{ color: '#212529' }}
                              contentStyle={{ 
                                backgroundColor: '#fff',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px'
                              }}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: '20px' }}
                              iconType="rect"
                            />
                            <Bar 
                              dataKey="estimado" 
                              fill="#0d6efd" 
                              name="Estimado"
                              radius={[2, 2, 0, 0]}
                            />
                            <Bar 
                              dataKey="real" 
                              fill="#dc3545" 
                              name="Real"
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Summary Table */}
                    <div className="col-lg-4">
                      <h6 className="fw-semibold mb-3">Resumen de variación</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th className="small text-muted">Categoría</th>
                              <th className="small text-muted text-end">Variación</th>
                              <th className="small text-muted text-end">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {costBreakdown.map((item, index) => {
                              const percentage = ((item.variance / item.estimado) * 100).toFixed(1);
                              const isPositive = item.variance > 0;
                              const isNeutral = item.variance === 0;
                              
                              return (
                                <tr key={index}>
                                  <td className="small">{item.category}</td>
                                  <td className={`small text-end fw-medium ${
                                    isNeutral ? 'text-muted' : isPositive ? 'text-danger' : 'text-success'
                                  }`}>
                                    {isPositive ? '+' : ''}{formatCurrency(item.variance)}
                                  </td>
                                  <td className={`small text-end ${
                                    isNeutral ? 'text-muted' : isPositive ? 'text-danger' : 'text-success'
                                  }`}>
                                    {isPositive ? '+' : ''}{percentage}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Total Variance */}
                      <div className="border-top pt-3 mt-3">
                        <div className="d-flex justify-content-between">
                          <span className="fw-semibold">Total</span>
                          <span className="fw-bold text-danger">
                            {formatCurrency(costBreakdown.reduce((sum, item) => sum + item.variance, 0))}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between small text-muted">
                          <span>Porcentaje:</span>
                          <span>
                            {(((costBreakdown.reduce((sum, item) => sum + item.variance, 0)) / 
                              costBreakdown.reduce((sum, item) => sum + item.estimado, 0)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Expenses Section */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="card-title h4 fw-semibold mb-0">Gastos adicionales</h2>
                    <button 
                      className="btn btn-success btn-sm d-flex align-items-center gap-2"
                      onClick={() => setShowFormGastos(!showFormGastos)}
                    >
                      <Plus size={16} />
                      Agregar gasto
                    </button>
                  </div>

                  {/* Form for new expense */}
                  {showFormGastos && (
                    <div className="border rounded p-4 mb-4 bg-light">
                      <h6 className="fw-semibold mb-3">Registrar nuevo gasto</h6>
                      <form onSubmit={handleAgregarGasto}>
                        <div className="row g-3">
                          <div className="col-md-3">
                            <label className="form-label small">Fecha</label>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={nuevoGasto.fecha}
                              onChange={(e) => setNuevoGasto({...nuevoGasto, fecha: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small">Descripción</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Descripción"
                              value={nuevoGasto.descripcion}
                              onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small">Monto</label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm"
                              placeholder="0.00"
                              value={nuevoGasto.monto}
                              onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small">Estado de pago</label>
                            <select
                              className="form-select form-select-sm"
                              value={nuevoGasto.estadoPago}
                              onChange={(e) => setNuevoGasto({...nuevoGasto, estadoPago: e.target.value})}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Pagado">Pagado</option>
                            </select>
                          </div>
                          <div className="col-md-1 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary btn-sm w-100">Guardar</button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Expenses List */}
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th className="small">Fecha</th>
                          <th className="small">Descrición</th>
                          <th className="small text-end">Monto</th>
                          <th className="small text-center">Estado</th>
                          <th className="small text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listaGastosAdicionales.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted py-4">
                              Sin gastos adicionales registrados
                            </td>
                          </tr>
                        ) : (
                          listaGastosAdicionales.map((gasto) => (
                            <tr key={gasto.idGasto}>
                              <td className="small">{new Date(gasto.fecha).toLocaleDateString()}</td>
                              <td className="small">{gasto.descripcion}</td>
                              <td className="small text-end fw-medium">{formatCurrency(gasto.monto)}</td>
                              <td className="text-center">
                                <select
                                  className={`${getStatusBadgeClass(gasto.estadoPago)} badge rounded-pill border-0`}
                                  style={{fontSize: '0.75rem', position: 'relative'}}
                                  value={gasto.estadoPago}
                                  onChange={(e) => handleActualizarGasto(gasto.idGasto, e.target.value)}
                                >
                                  <option value="Pendiente">Pendiente</option>
                                  <option value="Pagado">Pagado</option>
                                </select>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleEliminarGasto(gasto.idGasto)}
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      {listaGastosAdicionales.length > 0 && (
                        <tfoot className="table-light">
                          <tr>
                            <th colSpan="2" className="small">Total gastos adicionales:</th>
                            <th className="small text-end">
                              {formatCurrency(listaGastosAdicionales.reduce((sum, exp) => sum + exp.monto, 0))}
                            </th>
                            <th colSpan="2"></th>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
