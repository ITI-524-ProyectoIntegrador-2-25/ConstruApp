import { useEffect, useState, useCallback } from 'react'

// API
import { getEmpleados, getEmpleado, updateEmpleado, insertEmpleado } from '../api/Empleados'

export const useEmpleados = () => {
  const [Empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    const usuarioStr = localStorage.getItem('currentUser')
    if (!usuarioStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }

    const user = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)
    
    setLoading(true)
    setError('')

    try {
      const data = await getEmpleados(correo)
      setEmpleados(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('No se pudieron cargar los Empleados.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { Empleados, loading, error, refetch }
}

export const useEmpleado = (idEmpleado) => {
  const [EmpleadoDetalle, setEmpleadoDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    if (!idEmpleado) {
      setError('ID de empleado requerido')
      setLoading(false)
      return
    }

    const usuarioStr = localStorage.getItem('currentUser')
    if (!usuarioStr) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }

    const user = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)
    
    setLoading(true)
    setError('')

    try {
      const data = await getEmpleado(correo, idEmpleado)
      
      if (Array.isArray(data)) {
        if (data.length === 0) throw new Error('Empleado no encontrado')
        setEmpleadoDetalle(data[0])
      } else if (typeof data === 'object' && data.idEmpleado) {
        setEmpleadoDetalle(data)
      } else {
        throw new Error('Formato inesperado del API')
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar el empleado.')
    } finally {
      setLoading(false)
    }
  }, [idEmpleado])

  useEffect(() => {
    if (idEmpleado) {
      refetch()
    }
  }, [idEmpleado, refetch])

  return { EmpleadoDetalle, setEmpleadoDetalle, loading, error, refetch }
}

export const useInsertarActualizarEmpleados = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const guardarEmpleado = async (Empleado) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      let resultado
      if (Empleado.idEmpleado) {
        resultado = await updateEmpleado(Empleado)
      } else {
        resultado = await insertEmpleado(Empleado)
      }

      console.log('Resultado de la operación:', resultado)
      setSuccess(true)
      return true
    } catch (err) {
      setError(err.message || 'Error al guardar el Empleado')
      return false
    } finally {
      setLoading(false)
    }
  }
  const resetStates = () => {
    setError('')
    setSuccess(false)
  }

  return { guardarEmpleado, loading, error, success, resetStates }
}