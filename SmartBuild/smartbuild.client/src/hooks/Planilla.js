// src/hooks/Planilla.js
import { useEffect, useState } from 'react'

// ===== API Planilla =====
import {
  getPlanilla,          // GET  /PlanillaApi/GetPlanilla        (usuario)
  getPlanillaByInfo,    // GET  /PlanillaApi/GetPlanillabyInfo  (idPlanilla, Usuario)
  insertPlanilla,       // POST /PlanillaApi/InsertPlanilla
  updatePlanilla        // PUT  /PlanillaApi/UpdatePlanilla
} from '../api/Planilla'

// ===== API PlanillaDetalle
import {
  getPlanillaDetalle,         // GET  /PlanillaDetalleApi/GetPlanillaDetalle (usuario)
  insertPlanillaDetalle,      // POST /PlanillaDetalleApi/InsertPlanillaDetalle
  updatePlanillaDetalle       // PUT  /PlanillaDetalleApi/UpdatePlanillaDetalle
} from '../api/PlanillaDetalle'


/* =========================================
   Helpers
   ========================================= */
function getUserFromStorage () {
  const raw = localStorage.getItem('currentUser')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}


/* =========================================
   PLANILLAS (lista y 1 item)
   ========================================= */

export const usePlanillas = () => {
  const [Planillas, setPlanillas] = useState([])
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
    const fetchPlanillas = async () => {
      try {
        const data = await getPlanilla(correo)
        console.log('Planillas:', data)
        setPlanillas(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las Planillas.')
      } finally {
        setLoading(false)
      }
    }

    fetchPlanillas()
  }, [])

  return { Planillas, loading, error }
}

export const usePlanilla = (idPlanilla) => {
  const [PlanillaDetalle, setPlanillaDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!idPlanilla) {
      setError('ID de planilla no válido')
      setLoading(false)
      return
    }

    const user = getUserFromStorage()
    if (!user) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }

    const correo = user.correo || user.usuario
    const fetchPlanilla = async () => {
      try {
        const data = await getPlanillaByInfo(Number(idPlanilla), correo)
        console.log('PlanillaByInfo:', data)

        if (Array.isArray(data)) {
          if (data.length === 0) throw new Error('Planilla no encontrada')
          setPlanillaDetalle(data[0])
        } else if (data && typeof data === 'object' && (data.idPlanilla || data.IdPlanilla)) {
          setPlanillaDetalle(data)
        } else {
          throw new Error('Formato inesperado del API')
        }
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar la Planilla.')
      } finally {
        setLoading(false)
      }
    }

    fetchPlanilla()
  }, [idPlanilla])

  return { PlanillaDetalle, setPlanillaDetalle, loading, error }
}

/* =========================================
   INSERT y UPDATE separados (Planilla)
   ========================================= */

export const useInsertarPlanilla = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const insertarPlanilla = async (Planilla) => {
    setLoading(true); setError(''); setSuccess(false)
    try {
      await insertPlanilla(Planilla)
      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al insertar la Planilla')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { insertarPlanilla, loading, error, success }
}

export const useActualizarPlanilla = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const actualizarPlanilla = async (Planilla) => {
    setLoading(true); setError(''); setSuccess(false)
    try {
      if (!Planilla?.idPlanilla && !Planilla?.IdPlanilla) {
        throw new Error('Falta idPlanilla para actualizar')
      }
      await updatePlanilla(Planilla)
      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar la Planilla')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { actualizarPlanilla, loading, error, success }
}


/* =========================================
   PLANILLA DETALLE (opcional, mismo patrón)
   ========================================= */

export const usePlanillaDetalles = (idPlanillaOpcional) => {
  const [Detalles, setDetalles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getUserFromStorage()
    if (!user) {
      setError('Usuario no autenticado')
      setLoading(false)
      return
    }

    const correo = user.correo || user.usuario
    const fetchDetalles = async () => {
      try {
        const data = await getPlanillaDetalle(correo)
        const list = Array.isArray(data) ? data : []
        const filtered = idPlanillaOpcional
          ? list.filter(d => Number(d.planillaID ?? d.PlanillaID) === Number(idPlanillaOpcional))
          : list
        setDetalles(filtered)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los Detalles de planilla.')
      } finally {
        setLoading(false)
      }
    }

    fetchDetalles()
  }, [idPlanillaOpcional])

  return { Detalles, loading, error, setDetalles }
}

export const useInsertarPlanillaDetalle = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const insertarPlanillaDetalle = async (Detalle) => {
    setLoading(true); setError(''); setSuccess(false)
    try {
      await insertPlanillaDetalle(Detalle)
      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al insertar el Detalle de planilla')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { insertarPlanillaDetalle, loading, error, success }
}

export const useActualizarPlanillaDetalle = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const actualizarPlanillaDetalle = async (Detalle) => {
    setLoading(true); setError(''); setSuccess(false)
    try {
      const id =
        Detalle?.idDetallePlanilla ??
        Detalle?.idPlanillaDetalle ??
        Detalle?.IdDetallePlanilla
      if (!id) throw new Error('Falta idDetallePlanilla para actualizar')
      await updatePlanillaDetalle(Detalle)
      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar el Detalle de planilla')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { actualizarPlanillaDetalle, loading, error, success }
}
