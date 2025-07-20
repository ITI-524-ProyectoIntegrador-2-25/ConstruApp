// src/components/pages/dashboard/DetalleDashboard.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './DetalleDashboard.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetalleDashboard() {
  const { idPresupuesto } = useParams()
  const navigate = useNavigate()
  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }

    const user = JSON.parse(userStr)
    const correo = encodeURIComponent(user.correo || user.usuario)
    const url = `${API_BASE}/PresupuestoApi/GetPresupuestoByID?idPresupuesto=${idPresupuesto}&usuario=${correo}`

    console.log("URL solicitada:", url)

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Estado HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        console.log("Respuesta del API:", data)
        if (Array.isArray(data)) {
          if (data.length === 0) throw new Error('Presupuesto no encontrado')
          setDetalle(data[0])
        } else if (typeof data === 'object' && data.idPresupuesto) {
          setDetalle(data)
        } else {
          throw new Error('Formato inesperado del API')
        }
      })
      .catch(err => {
        console.error("Error al obtener el detalle:", err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [idPresupuesto])

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (!detalle) return <p className="detalle-error">No se encontró el detalle del presupuesto.</p>

  // Helper to format numbers with thousands separator and 2 decimals
  const formatCurrency = (value) => {
    if (typeof value !== 'number') value = Number(value)
    if (isNaN(value)) return ''
    return value.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

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
          Presupuesto #{detalle.idPresupuesto}
        </h2>
      </header>

      <div className="detalle-grid">
        <div className="detalle-row">
          <span className="label">Cliente:</span>
          <span className="value">{detalle.nombreCliente}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Tipo de cliente:</span>
          <span className="value">{detalle.tipoCliente}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Descripción:</span>
          <span className="value">{detalle.descripcion}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha de inicio:</span>
          <span className="value">{new Date(detalle.fechaInicio).toLocaleDateString()}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha fin estimada:</span>
          <span className="value">{new Date(detalle.fechaFin).toLocaleDateString()}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha fin real:</span>
          <span className="value">{new Date(detalle.fechaFinReal).toLocaleDateString()}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Penalización:</span>
          <span className="value">{detalle.penalizacion ? 'Sí' : 'No'}</span>
        </div>
        {detalle.penalizacion && (
          <div className="detalle-row">
            <span className="label">Monto penalización:</span>
            <span className="value">₡ {formatCurrency(detalle.montoPenalizacion)}</span>
          </div>
        )}
        <div className="detalle-row">
          <span className="label">Materia prima (cotizada):</span>
          <span className="value">₡ {formatCurrency(detalle.materiaPrimaCotizada)}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Mano de obra (cotizada):</span>
          <span className="value">₡ {formatCurrency(detalle.manoObraCotizada)}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Materia prima (real):</span>
          <span className="value">₡ {formatCurrency(detalle.materiaPrimaCostoReal)}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Mano de obra (real):</span>
          <span className="value">₡ {formatCurrency(detalle.manoObraCostoReal)}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Subcontrato (real):</span>
          <span className="value">₡ {formatCurrency(detalle.subContratoCostoReal)}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Otros gastos:</span>
          <span className="value">₡ {formatCurrency(detalle.otrosGastos)}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Ingreso:</span>
          <span className="value">{detalle.cuandoIngreso}</span>
        </div>
      </div>
    </div>
  )
}
