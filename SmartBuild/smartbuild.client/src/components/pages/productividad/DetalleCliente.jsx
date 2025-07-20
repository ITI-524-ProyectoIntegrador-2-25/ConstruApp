// src/components/pages/dashboard/DetalleCliente.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import './DetalleCliente.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function DetalleCliente() {
  const { idCliente } = useParams()
  const navigate      = useNavigate()

  const [detalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser')
    if (!usuarioStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const user   = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)
    const url    = `${API_BASE}/ClientApi/GetClientInfo?idCliente=${idCliente}&usuario=${correo}`

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        return res.json()
      })
      .then(data => {
        // si viene como array, tomo el primer elemento
        const record = Array.isArray(data) && data.length ? data[0] : data
        setDetalle(record)
      })
      .catch(err => {
        console.error(err)
        setError('No se encontró el cliente.')
      })
      .finally(() => setLoading(false))
  }, [idCliente])

  if (loading) return <p className="detalle-loading">Cargando detalles…</p>
  if (error)   return <p className="detalle-error">{error}</p>
  if (!detalle) return <p className="detalle-error">No hay datos de cliente.</p>

  // formateo seguro de la fecha
  const formatoFecha = (() => {
    const raw = detalle.cuandoIngreso
    if (!raw) return ''
    // reemplazo el espacio por T para que Date.parse lo reconozca
    const iso = raw.replace(' ', 'T')
    const d   = new Date(iso)
    if (!isNaN(d)) return d.toLocaleDateString()
    // fallback: muestro el string original
    return raw
  })()

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
          Cliente #{detalle.idCliente}
        </h2>
      </header>

      <div className="detalle-grid">
        <div className="detalle-row">
          <span className="label">Razón social:</span>
          <span className="value">{detalle.razonSocial}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Identificación:</span>
          <span className="value">{detalle.identificacion}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Tipo:</span>
          <span className="value">{detalle.tipo}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Contacto:</span>
          <span className="value">{detalle.nombreContacto}</span>
        </div>
        <div className="detalle-row">
          <span className="label">Registro:</span>
          <span className="value">{formatoFecha}</span>
        </div>
      </div>
    </div>
  )
}
