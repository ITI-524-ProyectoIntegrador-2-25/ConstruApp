// src/components/pages/productividad/FormSubcontrato.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Select from 'react-select'
import '../../../styles/Dashboard.css'
import './FormActividad.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormSubcontrato() {
  const navigate = useNavigate()
  const alertRef = useRef(null)
  const { idSubcontrato } = useParams()

  const [presupuestosOpts, setPresupuestosOpts] = useState([])
  const [loading, setLoading] = useState(!!idSubcontrato)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [rawResponse, setRawResponse] = useState(null) // Guarda el JSON crudo de la API

  const [form, setForm] = useState({
    presupuesto: null,
    nombreProveedor: '',
    descripcionPresupuesto: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    porcentajeAvance: '',
    montoCotizado: ''
  })

















  // Cargar presupuestos
  useEffect(() => {
    const usr = localStorage.getItem('currentUser')
    if (!usr) return
    const { correo, usuario } = JSON.parse(usr)
    const usuarioParam = encodeURIComponent(correo || usuario)

    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${usuarioParam}`)
      .then(res => res.json())
      .then(data => {
        setPresupuestosOpts(
          data.map(p => ({
            value: p.idPresupuesto,
            label: p.descripcion
          }))
        )
      })
      .catch(err => console.error('Error cargando presupuestos:', err))
  }, [])







  // Cargar datos si es edición
  useEffect(() => {
    if (!idSubcontrato) return
    setLoading(true)

    const usr = localStorage.getItem('currentUser')
    if (!usr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }
    const { correo, usuario } = JSON.parse(usr)
    const usuarioParam = encodeURIComponent(correo || usuario)

    fetch(`${API_BASE}/SubcontratoApi/GetSubcontratoByID?idSubcontrato=${idSubcontrato}&usuario=${usuarioParam}`)
      .then(async res => {
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()

        setRawResponse(data) // Guardar JSON crudo para mostrar

        const presupuestoSelected = presupuestosOpts.find(p => p.value === data.presupuestoID) || null

        setForm({
          presupuesto: presupuestoSelected,
          nombreProveedor: data.nombreProveedor || '',
          descripcionPresupuesto: data.descripcionPresupuesto || '',
          descripcion: data.descripcion || '',
          fechaInicio: data.fechaInicioProyectada ? data.fechaInicioProyectada.slice(0, 16) : '',
          fechaFin: data.fechaFinProyectada ? data.fechaFinProyectada.slice(0, 16) : '',
          porcentajeAvance: data.porcentajeAvance?.toString() || '',
          montoCotizado: data.montoCotizado?.toString() || ''
        })
      })
      .catch(err => {
        console.error(err)
        setError('Error cargando subcontrato para edición.')
      })
      .finally(() => setLoading(false))
  }, [idSubcontrato, presupuestosOpts])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSelect = selected => {
    setForm(f => ({
      ...f,
      presupuesto: selected,
      descripcionPresupuesto: selected ? selected.label : ''
    }))
    setError('')
  }











  

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { presupuesto, nombreProveedor, descripcionPresupuesto, descripcion, fechaInicio, fechaFin, porcentajeAvance, montoCotizado } = form

    if (!presupuesto || !nombreProveedor.trim() || !descripcion.trim() || !fechaInicio || !fechaFin) {
      setError('Presupuesto, proveedor, descripción, fecha de inicio y fin son obligatorias')
      setSaving(false)
      return
    }

    const start = new Date(fechaInicio)
    const end = new Date(fechaFin)
    if (end <= start) {
      setError('La fecha de fin debe ser posterior a la de inicio')
      setSaving(false)
      return
    }

    try {
      const usr = localStorage.getItem('currentUser')
      if (!usr) throw new Error('Usuario no autenticado')
      const { correo, usuario } = JSON.parse(usr)
      const quien = correo || usuario
      const ahora = new Date().toISOString()

      const payload = {
        usuario: quien,
        quienIngreso: quien,
        cuandoIngreso: ahora,
        quienModifico: quien,
        cuandoModifico: ahora,
        idSubcontrato: idSubcontrato ? Number(idSubcontrato) : 0,
        presupuestoID: presupuesto.value,
        nombreProveedor,
        descripcionPresupuesto,
        descripcion,
        fechaInicioProyectada: fechaInicio,
        fechaFinProyectada: fechaFin,
        fechaInicioReal: fechaInicio,
        fechaFinReal: fechaFin,
        porcentajeAvance: parseFloat(porcentajeAvance) || 0,
        montoCotizado: parseFloat(montoCotizado) || 0
      }

      const url = idSubcontrato
        ? `${API_BASE}/SubcontratoApi/UpdateSubcontrato`
        : `${API_BASE}/SubcontratoApi/InsertSubcontrato`

      const method = idSubcontrato ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/plain'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Status ${res.status}`)
      }

      alert(idSubcontrato ? 'Subcontrato actualizado' : 'Subcontrato creado')
      navigate('/dashboard/productividad/subcontratos')
    } catch (err) {
      console.error('Error guardando subcontrato:', err)
      setError(err.message || 'No se pudo guardar el subcontrato')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando formulario...</p>

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar">
          <ChevronLeft size={20} />
        </button>
        <h1>{idSubcontrato ? 'Editar Subcontrato' : 'Nuevo Subcontrato'}</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        <div className="form-group">
          <label>Presupuesto asociado</label>
          <Select
            name="presupuesto"
            options={presupuestosOpts}
            value={form.presupuesto}
            onChange={handleSelect}
            placeholder="Seleccionar presupuesto…"
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        <div className="form-group">
          <label>Nombre del proveedor</label>
          <input
            name="nombreProveedor"
            type="text"
            value={form.nombreProveedor}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción del presupuesto</label>
          <input
            name="descripcionPresupuesto"
            type="text"
            value={form.descripcionPresupuesto}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Descripción del subcontrato</label>
          <textarea
            name="descripcion"
            rows={3}
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha y hora de inicio</label>
          <input
            name="fechaInicio"
            type="datetime-local"
            value={form.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha y hora de fin</label>
          <input
            name="fechaFin"
            type="datetime-local"
            value={form.fechaFin}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Porcentaje de avance (%)</label>
          <input
            name="porcentajeAvance"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.porcentajeAvance}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Monto cotizado (₡)</label>
          <input
            name="montoCotizado"
            type="number"
            min="0"
            step="0.01"
            value={form.montoCotizado}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={saving}>
          {saving ? 'Guardando...' : idSubcontrato ? 'Actualizar Subcontrato' : 'Crear Subcontrato'}
        </button>

        {/* Cuadro Raw Response */}
        {idSubcontrato && (
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Raw Response (API)</label>
            <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px', maxHeight: '300px', overflowY: 'auto' }}>
              {rawResponse ? JSON.stringify(rawResponse, (key, value) => value ?? 'null', 2) : 'null'}
            </pre>
          </div>
        )}
      </form>
    </div>
  )
}
