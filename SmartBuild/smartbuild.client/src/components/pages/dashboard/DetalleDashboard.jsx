// src/components/pages/dashboard/DetalleDashboard.jsx
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './DetalleDashboard.css'

// Hook
import { usePresupuestoDetalle } from '../../../hooks/dashboard';

export default function DetalleDashboard() {
  const { idPresupuesto } = useParams()
  const navigate = useNavigate()

  const { presupuestoDetalle, loading, error } = usePresupuestoDetalle(idPresupuesto)

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (!presupuestoDetalle) return <p className="detalle-error">No se encontró el detalle del presupuesto.</p>

  // Helper to format numbers with thousands separator and 2 decimals
  const formatCurrency = (value) => {
    if (typeof value !== 'number') value = Number(value)
    if (isNaN(value)) return ''
    return value.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Array de campos monetarios
  const camposMonetarios = [
    { key: 'montoPenalizacion', label: 'Monto penalización:', condicional: presupuestoDetalle.penalizacion },
    { key: 'materiaPrimaCotizada', label: 'Materia prima (cotizada):' },
    { key: 'manoObraCotizada', label: 'Mano de obra (cotizada):' },
    { key: 'materiaPrimaCostoReal', label: 'Materia prima (real):' },
    { key: 'manoObraCostoReal', label: 'Mano de obra (real):' },
    { key: 'subContratoCostoReal', label: 'Subcontrato (real):' },
    { key: 'otrosGastos', label: 'Otros gastos:' }
  ]

  return (
    <div className="detalle-page">
      <header className="detalle-header">
        <button
          className="detalle-back"
          onClick={() => navigate(-1)}
          title="Volver"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="detalle-title">
          Presupuesto #{presupuestoDetalle.idPresupuesto}
        </h2>
      </header>

      <div className="detalle-grid">
        <div className="detalle-row">
          <span className="label">Cliente:</span>
          <span className="value">{presupuestoDetalle.nombreCliente}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Tipo de cliente:</span>
          <span className="value">{presupuestoDetalle.tipoCliente}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Descripción:</span>
          <span className="value">{presupuestoDetalle.descripcion}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha de inicio:</span>
          <span className="value">{new Date(presupuestoDetalle.fechaInicio).toLocaleDateString()}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha fin estimada:</span>
          <span className="value">{new Date(presupuestoDetalle.fechaFin).toLocaleDateString()}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha fin real:</span>
          <span className="value">{new Date(presupuestoDetalle.fechaFinReal).toLocaleDateString()}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Penalización:</span>
          <span className="value">{presupuestoDetalle.penalizacion ? 'Sí' : 'No'}</span>
        </div>
        
        {/* mejora de campos, he reemplazado las 28 líneas originales  */}
        {camposMonetarios
          .filter(campo => campo.condicional !== false)
          .map(campo => (
            <div key={campo.key} className="detalle-row">
              <span className="label">{campo.label}</span>
              <span className="value">₡ {formatCurrency(presupuestoDetalle[campo.key])}</span>
            </div>
          ))
        }
        
        <div className="detalle-row">
          <span className="label">Ingreso:</span>
          <span className="value">{presupuestoDetalle.cuandoIngreso}</span>
        </div>
      </div>
    </div>
  )
}