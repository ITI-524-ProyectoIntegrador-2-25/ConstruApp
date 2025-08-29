import { useEffect, useState } from 'react'

import {
  getUsuarios,          // GET  /UsuarioApi/GetUsuario        (usuario),
  updateUsuario        // PUT  /UsuarioApi/UpdateUsuario
} from '../api/usuario'

function getUserFromStorage () {
  const raw = localStorage.getItem('currentUser')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getUserFromStorage()
    if (!user) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }

    const correo = user.correo || user.usuario  // <- NO usar encodeURIComponent
    const fetchUsuarios = async () => {
      try {
        const data = await getUsuarios(correo)
        setUsuarios(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los usuarios.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  return { usuarios, loading, error }
}

export const useActualizarUsuario = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const actualizarUsuario = async (Usuario) => {
    setLoading(true); setError(''); setSuccess(false)
    try {
      if (!Usuario?.idUsuario) {
        throw new Error('Falta idUsuario para actualizar')
      }
      await updateUsuario(Usuario)
      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar el usuario')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { actualizarUsuario, loading, error, success }
}