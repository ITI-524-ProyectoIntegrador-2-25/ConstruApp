import { useEffect , useState } from 'react';

// API
import { getMateriaPrima, insertMateriaPrima, updateMateriaPrima } from '../api/materiaPrima';

export const useMateriaPrima = () => {
  const [materiaPrima, setMateriaPrima] = useState([]);
  const [loadingMateriaPrima, setLoading] = useState(true);
  const [errorMateriaPrima, setError] = useState('');

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr);
    const correo = encodeURIComponent(user.correo || user.usuario);

    const fetchMateriaPrima = async () => {
      try {
        const data = await getMateriaPrima(correo);
        setMateriaPrima(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los gastos.');
      } finally {
        setLoading(false);
      }
    };

    fetchMateriaPrima();
  }, []);

  return { materiaPrima, setMateriaPrima, loadingMateriaPrima, errorMateriaPrima };
};

export const useInsertarActualizarMateriaPrima = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // CAMBIO: esta función ya no comienza con "use"
  const guardarMateriaPrima = async (materiaPrima) => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      guardarMateriaPrima.usuario = correo;
      guardarMateriaPrima.idMateriaPrima
        ? await updateMateriaPrima(materiaPrima)
        : await insertMateriaPrima(materiaPrima)
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

  return { guardarMateriaPrima, loading, error, success }
}