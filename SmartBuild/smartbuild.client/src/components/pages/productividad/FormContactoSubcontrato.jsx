// src/components/pages/productividad/FormContactoSubcontrato.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './FormActividad.css'

const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export default function FormContactoSubcontrato() {
  const navigate = useNavigate()
  const alertRef = useRef(null)
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const subcontratoID = Number(searchParams.get('subcontratoId')) || 0

  const [form, setForm] = useState({
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    telefono: '',
    correoElectronico: '',
    esPrincipal: false
  })
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(0)

  // Fetch de clientes usando GET con query param
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const usr = localStorage.getItem('currentUser')
        if (!usr) throw new Error('Usuario no autenticado')
        const { usuario } = JSON.parse(usr)

        const res = await fetch(`${API_BASE}/ClientApi/GetClients?usuario=${encodeURIComponent(usuario)}`)
        if (!res.ok) throw new Error('No se pudieron cargar los clientes')
        const data = await res.json()
        setClientes(data)
      } catch (err) {
        console.error('Error cargando clientes:', err)
      }
    }
    fetchClientes()
  }, [])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const { nombre, primerApellido, telefono, correoElectronico } = form
    if (!nombre || !primerApellido || !telefono || !correoElectronico) {
      setError('Los campos Nombre, Primer Apellido, Teléfono y Correo son obligatorios')
      return
    }

    if (!subcontratoID) {
      setError('No se pudo determinar el SubcontratoID desde la URL')
      return
    }

    if (!clienteSeleccionado) {
      setError('Debe seleccionar un cliente')
      return
    }

    try {
      const usr = localStorage.getItem('currentUser')
      if (!usr) throw new Error('Usuario no autenticado')
      const { correo, usuario } = JSON.parse(usr)
      const quien = correo || usuario
      const ahora = new Date().toISOString()

      const contactoPayload = {
        usuario: quien,
        quienIngreso: quien,
        cuandoIngreso: ahora,
        quienModifico: quien,
        cuandoModifico: ahora,
        idContacto: 0,
        clientID: clienteSeleccionado,
        subcontratoID,
        nombre: form.nombre,
        primerApellido: form.primerApellido,
        segundoApellido: form.segundoApellido,
        telefono: form.telefono,
        correoElectronico: form.correoElectronico,
        esPrincipal: form.esPrincipal ? 1 : 0,
        nombreCompleto: `${form.nombre} ${form.primerApellido} ${form.segundoApellido}`.trim()
      }

      console.log('Intentando enviar payload:', contactoPayload)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const res = await fetch(`${API_BASE}/ContactApi/InsertContact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactoPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        let msg
        try { msg = await res.text() } catch { msg = `Status ${res.status}` }
        throw new Error(msg)
      }

      console.log('Contacto registrado con éxito')
      navigate(-1)

    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('Error: la petición tardó demasiado y fue cancelada')
        setError('La petición tardó demasiado y no se pudo completar')
      } else {
        console.error('Error registrando contacto:', err)
        setError(err.message || 'No se pudo guardar el contacto')
      }
    }
  }

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)} title="Regresar">
          <ChevronLeft size={20} />
        </button>
        <h1>Registrar Contacto de Subcontrato</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">

        <div className="form-group">
          <label>Cliente</label>
          <select
            value={clienteSeleccionado}
            onChange={e => setClienteSeleccionado(Number(e.target.value))}
            required
          >
            <option value={0} disabled>Seleccione un cliente</option>
            {clientes.map(c => (
              <option key={c.idCliente} value={c.idCliente}>{c.razonSocial}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Nombre</label>
          <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Primer Apellido</label>
          <input name="primerApellido" type="text" value={form.primerApellido} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Segundo Apellido</label>
          <input name="segundoApellido" type="text" value={form.segundoApellido} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input name="telefono" type="text" value={form.telefono} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input name="correoElectronico" type="email" value={form.correoElectronico} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="esPrincipal"
              checked={form.esPrincipal}
              onChange={handleChange}
            />{' '}
            Es Principal
          </label>
        </div>

        <button type="submit" className="btn-submit">
          Registrar Contacto
        </button>
      </form>
    </div>
  )
}
