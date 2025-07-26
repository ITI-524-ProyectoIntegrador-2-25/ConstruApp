import { useEffect , useState } from 'react';

// API
import { getPresupuestos, getPresupuestoDetalle } from '../api/dashboard';

export const usePresupuestos = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr);
    const correo = encodeURIComponent(user.correo || user.usuario);

    const fetchPresupuestos = async () => {
      try {
        const data = await getPresupuestos(correo);
        setPresupuestos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los proyectos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuestos();
  }, []);

  return { presupuestos, loading, error };
};

export const usePresupuestoDetalle = (idPresupuesto) => {
  const [presupuestoDetalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr);
    const correo = encodeURIComponent(user.correo || user.usuario);

    const fetchPresupuestoDetalle = async () => {
      try {
        const data = await getPresupuestoDetalle(correo, idPresupuesto);
        if (Array.isArray(data)) {
            if (data.length === 0) throw new Error('Presupuesto no encontrado')
            setDetalle(data[0])
        } else if (typeof data === 'object' && data.idPresupuesto) {
            setDetalle(data)
        } else {
            throw new Error('Formato inesperado del API')
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los proyectos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuestoDetalle();
  }, []);

  return { presupuestoDetalle, loading, error };
};