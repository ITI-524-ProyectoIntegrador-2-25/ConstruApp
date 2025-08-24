// src/components/pages/dashboard/FormDashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Edit, Save, X } from 'lucide-react';
import '../../../styles/Dashboard.css'
import './FormDashboard.css'

//Hook
import { usePresupuestoDetalle, useInsertarActualizarPresupuesto } from '../../../hooks/dashboard';
import { useClientes } from '../../../hooks/cliente'

export default function FormDashboard() {
  const navigate = useNavigate()

  const { idPresupuesto } = useParams()

  // traer lista de clientes y mapear a opciones
  const { clientes, loadingClients, errorClients } = useClientes()
  const { insertarActualizarPresupuesto, loadingActualizar, errorActualizar } = useInsertarActualizarPresupuesto();

  const optionsClientes = 
    clientes.map(c => ({ value: c.idCliente, label: c.razonSocial }));

  const [isChecked, setIsChecked] = useState(false);
  const handleChangePenalizacion = (event) => {
    const checked = event.target.checked;

    setIsChecked(checked);

    setForm(current => ({
      ...current,
      penalizacion: checked
    }))
  };

  const { presupuestoDetalle, loading, error } = usePresupuestoDetalle(idPresupuesto > 0 ? idPresupuesto : null)
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    cliente: { },
    fechaInicio: '',
    fechaFin: '',
    fechaInicioReal: '1900-01-01',
    fechaFinReal: '1900-01-01',
    penalizacion: false,
    montoPenalizacion: 0,
    descripcion: '',
    materiaPrimaCotizada: 0,
    manoObraCotizada: 0,
    materiaPrimaCostoReal: 0,
    manoObraCostoReal: 0,
    subContratoCostoReal: 0,
    subContratoCotizado: 0,
    otrosGastos: 0,
    estado: '',
    montoProyecto: 0
  })

  useEffect(() => {
    if (presupuestoDetalle && idPresupuesto && idPresupuesto > 0) {
      presupuestoDetalle.fechaInicio = presupuestoDetalle.fechaInicio?.slice(0, 10) || ''
      presupuestoDetalle.fechaFin = presupuestoDetalle.fechaFin?.slice(0, 10) || ''
      presupuestoDetalle.estado = presupuestoDetalle.estado ?? 'Sin iniciar'
      presupuestoDetalle.costoEstimado = (presupuestoDetalle.materiaPrimaCotizada || 0) + (presupuestoDetalle.manoObraCotizada || 0) + (presupuestoDetalle.subContratoCotizado || 0)
      presupuestoDetalle.costoActual = (presupuestoDetalle.materiaPrimaCostoReal || 0) + (presupuestoDetalle.manoObraCostoReal || 0) + (presupuestoDetalle.subContratoCostoReal || 0) + (presupuestoDetalle.otrosGastos || 0)
      presupuestoDetalle.gananciaPerdida = (presupuestoDetalle.montoProyecto || 0) - presupuestoDetalle.costoActual

      setIsChecked(presupuestoDetalle.penalizacion)
      setSaveSuccess(false)

      const clienteSeleccionado = clientes.find(
        c => c.idCliente === presupuestoDetalle.clienteID
      )

      setForm({
        cliente: clienteSeleccionado,
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
        estado: presupuestoDetalle.estado ?? 'Sin iniciar',
        montoProyecto: presupuestoDetalle.montoProyecto || 0
      })
    } else if (presupuestoDetalle) { } 
  }, [idPresupuesto, presupuestoDetalle, clientes])

  const handleInputChange = (field, value) => {
    setForm(current => ({
      ...current,
      [field]: value
    }))
  };

  const handleClientChange = (clienteID) => {
    const clienteSeleccionado = clientes.find(
      c => c.idCliente === clienteID
    )

    presupuestoDetalle.clienteID = clienteSeleccionado.idCliente;

    setForm(prev => ({
      ...prev,
      cliente: clienteSeleccionado
    }))
  }

  const handleSavePresupuesto = async (e) => {
    e.preventDefault();

    form.idPresupuesto = idPresupuesto;
    form.clienteID = form.cliente.idCliente

    const { res, success } = await insertarActualizarPresupuesto(form);

    if (success) {
      setSaveSuccess(true)

      if (idPresupuesto === '0' || idPresupuesto === 0) {
        let id = res[0].id

        setTimeout(() => {
          navigate(`/dashboard/proyectos/editar/${id}`);
        }, 3000);
      } else {
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000);
      }
    }
  }

  if (loading || loadingClients || loadingActualizar) return <p className="detalle-loading">Cargando detalles…</p>
  if (error || errorClients || errorActualizar) return <p className="detalle-error">{error || errorClients || errorActualizar}</p>
  if (!clientes) return <p className="detalle-error">No se encontraron clientes.</p>

  return (
    <>
      {/* Bootstrap CSS CDN */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <div className="bg-light min-vh-100">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button className="btn-back-modern" onClick={() => navigate(-1)} title="Volver">
              <ChevronLeft size={20} />
            </button>
            <div className="title-section">
              <h1 className="page-title">
                <Edit size={28} />
                Editar proyecto
              </h1>
              <p className="page-subtitle">Edita el presupuesto del proyecto</p>
            </div>
          </div>
        </div>

        <div className="container-fluid py-4">
          {/* Tab Content */}
          <div className="row g-4">
            {/* Project Basics */}
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-4">Información del proyecto</h5>
                  
                  <div className="mb-3">
                    <label className="form-label small">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small">Estado</label>
                      <select
                        className="form-select"
                        value={form.estado}
                        onChange={(e) => handleInputChange('estado', e.target.value)}
                      >
                        <option value="Sin iniciar">Sin iniciar</option>
                        <option value="En proceso">En progreso</option>
                        <option value="Completado">Completado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                    <div className="form-check col-6 mb-3">
                      <br />
                      <input
                        type="checkbox"
                        className="form-check-input ms-5"
                        style={{ fontSize: 'xx-large' }}
                        id="hasPenalization"
                        checked={isChecked}
                        onChange={handleChangePenalizacion}
                      />
                      <label className="form-check-label ms-2 mt-2" htmlFor="hasPenalization" style={{ fontSize: 'larger' }}>
                        Tiene penalización
                      </label>
                    </div>
                  </div>

                  {isChecked && (
                    <div className="border rounded p-3 mb-3 bg-light">
                      <div className="row g-3">
                        <div className="col-6">
                          <label className="form-label small">Periocidad</label>
                          <select
                            className="form-select"
                            value={form.periodoPenalizacion}
                            onChange={(e) => handleInputChange('periodoPenalizacion', e.target.value)}
                          >
                            <option value="Diaria">Día</option>
                            <option value="Mensual">Mes</option>
                            <option value="Trimestral">Trimestral</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="form-label small">Monto</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            placeholder="0.00"
                            value={form.montoPenalizacion}
                            onChange={(e) => handleInputChange('montoPenalizacion', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <small className="mt-2 d-block">
                        Especifica la penalización aplicable al proyecto.
                      </small>
                    </div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small">Fecha inicio</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.fechaInicio}
                        onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Fecha final</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.fechaFin}
                        onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client & Contacts */}
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-4">Cliente</h5>

                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label small">Cliente</label>
                      <div className="d-flex align-items-center gap-2">
                        <select
                          className="form-select"
                          value={form.cliente.idCliente}
                          onChange={(e) => handleClientChange(parseInt(e.target.value, 10))}
                        >
                          <option value="0">Seleccione un cliente</option>
                          {optionsClientes.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-4">
                      <label className="form-label small">Contacto principal</label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="text"
                          className="form-control"
                          value={form.cliente.nombreContacto}
                          disabled={true}
                        />
                      </div>
                    </div>
                    <div className="col-4">
                      <label className="form-label small">Correo</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.cliente.correoContacto}
                        disabled={true}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={form.cliente.telefonoContacto}
                        disabled={true}
                      />
                    </div>
                  </div>

                  {/* Financials */}
                  <h5 className="card-title">Información financiera</h5>
                  <label className="form-label small mb-4">Montos estimados</label>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small">Monto del proyecto</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.montoProyecto}
                        onChange={(e) => handleInputChange('montoProyecto', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Ganacia esperada</label>
                      <input
                        type="number"
                        className="form-control text-success"
                        disabled={true}
                        value={ form.montoProyecto - form.manoObraCotizada - form.materiaPrimaCotizada }
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small">Materia prima</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.materiaPrimaCotizada}
                        onChange={(e) => handleInputChange('materiaPrimaCotizada', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Mano de obra</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.manoObraCotizada}
                        onChange={(e) => handleInputChange('manoObraCotizada', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Action Bar */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm">
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={() => navigate(-1)}>
                  <X size={16} />
                  Descartar cambios
                </button>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleSavePresupuesto}>
                    <Save size={16} />
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
            {saveSuccess && (
              <div className="col-12">
                <div className="col-12">
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    Proyecto guardado con éxito.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}