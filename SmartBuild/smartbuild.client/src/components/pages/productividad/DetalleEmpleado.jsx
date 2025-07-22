// src/components/pages/planilla/DetalleEmpleado.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import './DetalleEmpleado.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetalleEmpleado() {
  const { idEmpleado } = useParams()
  const navigate = useNavigate()

  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('idEmpleado:', idEmpleado)
    const usuarioStr = localStorage.getItem('currentUser')
    if (!usuarioStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)
    console.log('Correo usuario:', correo)
    const url = `${API_BASE}/EmpleadoApi/GetEmpleadoInfo?idEmpleado=${idEmpleado}&usuario=${correo}`
    console.log('Fetch URL:', url)

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        console.log('API Empleado info:', data)
        const record = Array.isArray(data) && data.length > 0 ? data[0] : data
        setDetalle(record)
      })
      .catch(err => {
        console.error(err)
        setError('No se encontró el empleado.')
      })
      .finally(() => setLoading(false))
  }, [idEmpleado])

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error) return <p className="detalle-error">{error}</p>
  if (!detalle) return <p className="detalle-error">No hay datos del empleado.</p>

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return ''
    const iso = fechaStr.replace(' ', 'T')
    const d = new Date(iso)
    if (!isNaN(d)) return d.toLocaleDateString()
    return fechaStr
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
          Empleado #{detalle.idEmpleado}
        </h2>
      </header>

      <div className="detalle-grid">
        <div className="detalle-row">
          <span className="label">Nombre:</span>
          <span className="value">{detalle.nombre} {detalle.apellido}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Identificación:</span>
          <span className="value">{detalle.identificacion}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Correo:</span>
          <span className="value">{detalle.correo}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Puesto:</span>
          <span className="value">{detalle.puesto}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Salario por hora:</span>
          <span className="value">
            ₡{parseFloat(detalle.salarioHora || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="detalle-row">
          <span className="label">Fecha ingreso:</span>
          <span className="value">{formatearFecha(detalle.fechaIngreso)}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Activo:</span>
          <span className="value">{detalle.activo === '1' || detalle.activo === 'true' ? 'Sí' : 'No'}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Quien ingreso:</span>
          <span className="value">{detalle.quienIngreso}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Cuando ingreso:</span>
          <span className="value">{formatearFecha(detalle.cuandoIngreso)}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Quien modificó:</span>
          <span className="value">{detalle.quienModifico}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Cuando modificó:</span>
          <span className="value">{formatearFecha(detalle.cuandoModifico)}</span>
        </div>
      </div>
    </div>
  )
}
