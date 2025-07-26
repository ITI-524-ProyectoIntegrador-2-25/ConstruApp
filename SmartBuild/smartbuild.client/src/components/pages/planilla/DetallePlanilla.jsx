import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css' 
import './DetallePlanilla.css'            

// Hook
import { usePlanillaDetalle } from '../../../hooks/planillas'

export default function DetallePlanilla() {
  const { idPlanilla } = useParams()
  const navigate = useNavigate()

  const { planillaDetalle, loading, error } = usePlanillaDetalle(idPlanilla)

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (!planillaDetalle) return null

  // formateo seguro de la fecha de registro
  const fechaRegistro = (() => {
    if (!planillaDetalle.cuandoIngreso) return ''
    const iso = planillaDetalle.cuandoIngreso.replace(' ', 'T')
    const d = new Date(iso)
    return isNaN(d) ? planillaDetalle.cuandoIngreso : d.toLocaleDateString()
  })()

  return (
    <div className="detalle-page">
      <header className="detalle-header">
        <button
          className="detalle-back"
          onClick={() => navigate(-1)}
          title="Volver"
        >
          <ChevronLeft size={20}/>
        </button>
        <h2 className="detalle-title">
          Planilla #{planillaDetalle.idPlanilla}
        </h2>
      </header>

      <div className="detalle-grid">
        <div className="detalle-row">
          <span className="label">Nombre:</span>
          <span className="value">{planillaDetalle.nombre}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha inicio:</span>
          <span className="value">
            {new Date(planillaDetalle.fechaInicio).toLocaleDateString()}
          </span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha fin:</span>
          <span className="value">
            {new Date(planillaDetalle.fechaFin).toLocaleDateString()}
          </span>
        </div>
        <div className="detalle-row">
          <span className="label">Estado:</span>
          <span className="value">{planillaDetalle.estado}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Registro:</span>
          <span className="value">{fechaRegistro}</span>
        </div>
      </div>
    </div>
  )
}