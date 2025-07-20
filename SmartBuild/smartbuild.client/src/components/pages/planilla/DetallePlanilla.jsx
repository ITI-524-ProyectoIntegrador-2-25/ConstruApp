import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'       // el mismo CSS de detalle genérico
import './DetallePlanilla.css'            // ajustes específicos si los hubiera

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetallePlanilla() {
  const { idPlanilla } = useParams()
  const navigate       = useNavigate()

  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    fetch(
      `${API_BASE}/PlanillaApi/GetPlanillabyInfo`
      + `?idPlanilla=${idPlanilla}&Usuario=${correo}`
    )
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        // si viene como array, tomamos el primero
        const record = Array.isArray(data) && data.length
                     ? data[0]
                     : data
        setDetalle(record)
      })
      .catch(err => {
        console.error(err)
        setError('No se encontró la planilla.')
      })
      .finally(() => setLoading(false))
  }, [idPlanilla])

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error)   return <p className="detalle-error">{error}</p>
  if (!detalle) return null

  // formateo seguro de la fecha de registro
  const fechaRegistro = (() => {
    if (!detalle.cuandoIngreso) return ''
    const iso = detalle.cuandoIngreso.replace(' ', 'T')
    const d = new Date(iso)
    return isNaN(d) ? detalle.cuandoIngreso : d.toLocaleDateString()
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
          Planilla #{detalle.idPlanilla}
        </h2>
      </header>

      <div className="detalle-grid">
        <div className="detalle-row">
          <span className="label">Nombre:</span>
          <span className="value">{detalle.nombre}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha inicio:</span>
          <span className="value">
            {new Date(detalle.fechaInicio).toLocaleDateString()}
          </span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha fin:</span>
          <span className="value">
            {new Date(detalle.fechaFin).toLocaleDateString()}
          </span>
        </div>
        <div className="detalle-row">
          <span className="label">Estado:</span>
          <span className="value">{detalle.estado}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Registro:</span>
          <span className="value">{fechaRegistro}</span>
        </div>
      </div>
    </div>
  )
}
