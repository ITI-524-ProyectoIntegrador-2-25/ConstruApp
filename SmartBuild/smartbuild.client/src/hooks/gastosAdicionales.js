import { useEffect , useState } from 'react';

// API
import { getGastosAdicionales, updateGastoAdicional, insertGastoAdicional, deleteGastoAdicional } from '../api/gastosAdicionales';

export const useGastosAdicionales = () => {
  const [gastosAdicionales, setGastosAdicionales] = useState([]);
  const [loadingGastosAdicionales, setLoading] = useState(true);
  const [errorGastosAdicionales, setError] = useState('');

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr);
    const correo = encodeURIComponent(user.correo || user.usuario);

    const fetchGastosAdicionales = async () => {
      try {
        const data = await getGastosAdicionales(correo);
        setGastosAdicionales(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los gastos.');
      } finally {
        setLoading(false);
      }
    };

    fetchGastosAdicionales();
  }, []);

  return { gastosAdicionales, setGastosAdicionales, loadingGastosAdicionales, errorGastosAdicionales };
};

export const useInsertarActualizarGastosAdicionales = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // CAMBIO: esta función ya no comienza con "use"
  const guardarGastoAdicional = async (gastoAdicional) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      gastoAdicional.idGastoAdicional
        ? await updateGastoAdicional(gastoAdicional)
        : await insertGastoAdicional(gastoAdicional)
      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar el gasto')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { guardarGastoAdicional, loading, error, success }
}

export const useDeleteGastoAdicional = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const eliminarGastoAdicional = async (gastoAdicional) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      deleteGastoAdicional(gastoAdicional)
      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar el gasto')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { eliminarGastoAdicional, loading, error, success }
}