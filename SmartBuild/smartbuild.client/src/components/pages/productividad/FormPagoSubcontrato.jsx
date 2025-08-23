// src/components/pages/productividad/FormPagoSubcontrato.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormActividad.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormPagoSubcontrato() {
  const navigate = useNavigate()
  const alertRef = useRef(null)

  const [subcontratosOpts, setSubcontratosOpts] = useState([])
  const [form, setForm] = useState({
    subcontrato: null,
    montoPagado: '',
    fechaPago: ''
  })
  const [error, setError] = useState('')


  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const { correo, usuario } = JSON.parse(usr)
    const usuarioParam = encodeURIComponent(correo || usuario)

    fetch(`${API_BASE}/SubcontratoApi/GetSubcontratos?usuario=${usuarioParam}`)
      .then(res => res.json())
      .then(data => {
        setSubcontratosOpts(
          data.map(s => ({
            value: s.idSubcontrato,
            label: `${s.idSubcontrato} - ${s.nombreProveedor || 'Sin proveedor'}`,
            montoCotizado: s.montoCotizado || 0
          }))
        )
      })
      .catch(err => console.error('Error cargando subcontratos:', err))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSelect = selected => {
    setForm(f => ({ ...f, subcontrato: selected }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const { subcontrato, montoPagado, fechaPago } = form
    if (!subcontrato || !montoPagado || !fechaPago) {
      setError('Todos los campos son obligatorios')
      return
    }

    try {
      const usr = localStorage.getItem('currentUser')
      if (!usr) throw new Error('Usuario no autenticado')
      const { correo, usuario } = JSON.parse(usr)
      const quien = correo || usuario
      const ahora = new Date().toISOString()


      const pagosRes = await fetch(
        `${API_BASE}/PagoSubcontratoApi/GetPagosSubcontrato?subcontratoID=${subcontrato.value}`
      )
      let pagosData = await pagosRes.json()


      if (!Array.isArray(pagosData)) {
        if (pagosData) {
          pagosData = [pagosData]
        } else {
          pagosData = []
        }
      }

      const sumaPagos = pagosData.reduce((acc, p) => acc + (p.montoPagado || 0), 0)

      const montoNuevo = parseFloat(montoPagado)
      const montoCotizado = subcontrato.montoCotizado


      if (sumaPagos + montoNuevo > montoCotizado) {
        setError(
          `No se puede registrar el pago. La cantidad ingresada excede el monto cotizado (${montoCotizado}).`
        )
        return
      }

    
      const pagoPayload = {
        usuario: quien,
        quienIngreso: quien,
        cuandoIngreso: ahora,
        quienModifico: quien,
        cuandoModifico: ahora,
        idPago: 0,
        subcontratoID: subcontrato.value,
        montoPagado: montoNuevo,
        fechaPago: new Date(fechaPago).toISOString()
      }

      const res = await fetch(`${API_BASE}/PagoSubcontratoApi/InsertPagoSubcontrato`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain'
        },
        body: JSON.stringify(pagoPayload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Status ${res.status}`)
      }

      navigate(-1)
    } catch (err) {
      console.error('Error registrando pago:', err)
      setError(err.message || 'No se pudo guardar el pago')
    }
  }

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar">
          <ChevronLeft size={20} />
        </button>
        <h1>Registrar Pago de Subcontrato</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        {/* Selector de Subcontrato */}
        <div className="form-group">
          <label>Subcontrato</label>
          <Select
            name="subcontrato"
            options={subcontratosOpts}
            value={form.subcontrato}
            onChange={handleSelect}
            placeholder="Seleccionar subcontrato…"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Monto pagado */}
        <div className="form-group">
          <label>Monto pagado (₡)</label>
          <input
            name="montoPagado"
            type="number"
            min="0"
            step="0.01"
            value={form.montoPagado}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fecha del pago */}
        <div className="form-group">
          <label>Fecha del pago</label>
          <input
            name="fechaPago"
            type="datetime-local"
            value={form.fechaPago}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-submit">
          Registrar Pago
        </button>
      </form>
    </div>
  )
}
