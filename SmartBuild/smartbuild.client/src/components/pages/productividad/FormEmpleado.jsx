import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import '../../../styles/Dashboard.css'
import './FormCliente.css'

// ✅ Hook de insertar/actualizar empleados
import { useInsertarActualizarEmpleados } from '../../../hooks/Empleados'

export default function FormEmpleado() {
  const navigate = useNavigate()
  const alertRef = useRef(null)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    identificacion: '',
    puesto: '',
    salarioHora: '',
    fechaIngreso: '',
    correo: '',
    activo: 'true'
  })

  const [error, setError] = useState('')

  // ✅ Hook para insertar/actualizar
  const { guardarEmpleado, loading } = useInsertarActualizarEmpleados()

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!form.nombre || !form.identificacion) {
      setError('Nombre e identificación son obligatorios')
      return
    }

    try {
      const usuarioStr = localStorage.getItem('currentUser')
      if (!usuarioStr) throw new Error('Usuario no autenticado')
      const user = JSON.parse(usuarioStr)

      const correoUser = user.correo || user.usuario || user.email || user.username || user.userName
      if (!correoUser) throw new Error('No se encontró el email del usuario')

      const fechaAhora = new Date().toISOString()

      const payload = {
        usuario: correoUser,
        quienIngreso: correoUser,
        cuandoIngreso: fechaAhora,
        quienModifico: correoUser,
        cuandoModifico: fechaAhora,
        idEmpleado: 0,
        nombre: form.nombre,
        apellido: form.apellido,
        identificacion: form.identificacion,
        puesto: form.puesto,
        salarioHora: form.salarioHora,
        fechaIngreso: form.fechaIngreso,
        correo: form.correo,
        activo: form.activo
      }

      const ok = await guardarEmpleado(payload)

      if (ok) navigate('/dashboard/productividad/empleados')
    } catch (err) {
      console.error('Error al guardar empleado:', err)
      setError(err.message || 'No se pudo guardar el empleado. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="form-dashboard-page">
      <header className="form-dashboard-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          title="Regresar"
        >
          <ChevronLeft size={20} />
        </button>
        <h1>Nuevo Empleado</h1>
      </header>

      {error && (
        <div ref={alertRef} className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-dashboard">
        <div className="form-group">
          <label>Nombre</label>
          <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input name="apellido" type="text" value={form.apellido} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Identificación</label>
          <input name="identificacion" type="text" value={form.identificacion} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Puesto</label>
          <input name="puesto" type="text" value={form.puesto} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Salario por hora</label>
          <input name="salarioHora" type="number" value={form.salarioHora} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Fecha de ingreso</label>
          <input name="fechaIngreso" type="date" value={form.fechaIngreso} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Correo</label>
          <input name="correo" type="email" value={form.correo} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Activo</label>
          <select name="activo" value={form.activo} onChange={handleChange}>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar empleado'}
        </button>
      </form>
    </div>
  )
}
