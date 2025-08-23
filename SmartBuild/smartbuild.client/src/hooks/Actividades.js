import { useEffect , useState, useCallback } from 'react';

// API
import { getActividades, getActividad, updateActividad, insertActividad } from '../api/Actividades';

export const useActividades = () => {
  const [Actividades, setActividades] = useState([]);
  const [loadingActividades, setLoading] = useState(true);
  const [errorActividades, setError] = useState('');

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr);
    const correo = encodeURIComponent(user.correo || user.usuario);

    const fetchActvidades = async () => {
      try {
        const data = await getActividades(correo);
        setActividades(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('No se pudieron cargar las Actividades.');
      } finally {
        setLoading(false);
      }
    };

    fetchActvidades();
  }, []);

  return { Actividades, loadingActividades, errorActividades };
};

export const useActividad = (idActividad) => {
  const [ActividadDetalle, setDetalle] = useState(null)
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
      const data = await getActividad(correo, idActividad)
      
      if (Array.isArray(data)) {
        if (data.length === 0) throw new Error('Actividad no encontrada')
        setDetalle(data[0])
      } else if (typeof data === 'object' && data.idActividad) {
        setDetalle(data)
      } else {
        throw new Error('Formato inesperado del API')
      }
    } catch (err) {
      setError('No se pudieron cargar las Actividades.')
    } finally {
      setLoading(false)
    }
  }, [idActividad])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { ActividadDetalle, loading, error, refetch }
}

export const useInsertarActualizarActividades = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)


  const guardarActividad = async (actividad) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      actividad.idActividad
        ? await updateActividad(actividad)
        : await insertActividad(actividad)

      setSuccess(true)
      return true
    } catch (err) {
      setError(err.message || 'Error al guardar la actividad')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { guardarActividad, loading, error, success }
}