// src/components/pages/productividad/DetalleActividades.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './DetalleActividades.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetalleActividades() {
  const { idActividad } = useParams()
  const navigate = useNavigate()

  const [detalle, setDetalle]         = useState(null)
  const [presupuestos, setPresupuestos] = useState([])
  const [empleados, setEmpleados]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (!idActividad) {
      setError('ID de actividad no especificado.')
      setLoading(false)
      return
    }
    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado.')
      setLoading(false)
      return
    }
    const user   = JSON.parse(usr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    setLoading(true)
    Promise.all([
      fetch(
        `${API_BASE}/ActividadApi/GetActividadbyInfo?idActividad=${idActividad}&usuario=${correo}`
      ).then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      }),
      fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`)
        .then(res => {
          if (!res.ok) throw new Error(`Status ${res.status}`)
          return res.json()
        }),
      fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${correo}`)
        .then(res => {
          if (!res.ok) throw new Error(`Status ${res.status}`)
          return res.json()
        })
    ])
      .then(([rawAct, presData, empData]) => {
        const activity = Array.isArray(rawAct) ? rawAct[0] : rawAct
        if (!activity) {
          setError('Actividad no encontrada.')
        } else {
          setDetalle(activity)
          setPresupuestos(presData)
          setEmpleados(empData)
        }
      })
      .catch(err => {
        console.error(err)
        setError('No se pudo cargar la información.')
      })
      .finally(() => setLoading(false))
  }, [idActividad])

  if (loading) return <p>Cargando detalles…</p>
  if (error)   return <p className="detalle-error">{error}</p>
  if (!detalle) return null

  // Parseamos fechas completas (fecha + hora)
  const startProj = new Date(detalle.fechaInicioProyectada)
  const endProj   = new Date(detalle.fechaFinProyectada)
  const startReal = new Date(detalle.fechaInicioReal)
  const endReal   = new Date(detalle.fechaFinReal)

  // Cálculo de duración en horas, con decimales
  const durHours = ((endReal.getTime() - startReal.getTime()) / (1000 * 60 * 60)).toFixed(2)

  // Búsqueda de objetos relacionados
  const presObj = presupuestos.find(p => p.idPresupuesto === detalle.presupuestoID)
  const empObj  = empleados.find(e => e.idEmpleado === detalle.empleadoID)

  // Formateadores
  const fmtDate = d => d.toLocaleDateString()
  const fmtTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

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
          Actividad #{detalle.idActividad}
        </h2>
      </header>

      <div className="detalle-grid">
        {/* Descripción */}
        <div className="detalle-row">
          <span className="label">Descripción:</span>
          <span className="value">{detalle.descripcion}</span>
        </div>

        {/* Presupuesto */}
        <div className="detalle-row">
          <span className="label">Presupuesto:</span>
          <span className="value">
            {presObj?.descripcion ?? detalle.presupuestoID}
          </span>
        </div>

        {/* Empleado */}
        <div className="detalle-row">
          <span className="label">Empleado:</span>
          <span className="value">
            {empObj
              ? empObj.nombreEmpleado 
                || `${empObj.nombre || ''} ${empObj.apellido || ''}`.trim()
              : detalle.empleadoID
            }
          </span>
        </div>

        {/* Fecha proyectada */}
        <div className="detalle-row">
          <span className="label">Fecha proyectada:</span>
          <span className="value">
            {fmtDate(startProj)} {fmtTime(startProj)}
            {' – '}
            {fmtDate(endProj)} {fmtTime(endProj)}
          </span>
        </div>

        {/* Fecha real */}
        <div className="detalle-row">
          <span className="label">Fecha real:</span>
          <span className="value">
            {fmtDate(startReal)} {fmtTime(startReal)}
            {' – '}
            {fmtDate(endReal)} {fmtTime(endReal)}
          </span>
        </div>

        {/* Duración */}
        <div className="detalle-row">
          <span className="label">Duración (horas):</span>
          <span className="value">{durHours} h</span>
        </div>

        {/* Estado */}
        <div className="detalle-row">
          <span className="label">Estado:</span>
          <span className="value">
            {detalle.estado || 'Sin especificar'}
          </span>
        </div>
      </div>
    </div>
  )
}
