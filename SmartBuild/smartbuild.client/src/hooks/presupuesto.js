import { useEffect, useState } from 'react';

// API
import { getPresupuesto, getPresupuestoDetalle } from '../api/presupuesto';

export const usePresupuestos = () => {
  const [Presupuestos, setPresupuestos] = useState([]);
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
        const data = await getPresupuesto(correo);
        setPresupuestos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los Presupuestos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuestos();
  }, []);

  return { Presupuestos, loading, error };
};

export const usePresupuestoDetalle = (idPresupuesto) => {
  const [PresupuestoDetalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!idPresupuesto) {
      setError('ID de Presupuesto no válido');
      setLoading(false);
      return;
    }

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
        const data = await getPresupuestoDetalle(correo, idPresupuesto)
        
        if (Array.isArray(data)) {
          if (data.length === 0) throw new Error('Presupuesto no encontrado')
          setDetalle(data[0])
        } else if (typeof data === 'object' && data.idPresupuesto) {
          setDetalle(data)
        } else {
          throw new Error('Formato inesperado del API')
        }
      } catch (err) {
        console.error('Error al cargar Presupuesto detalle:', err);
        setError('No se pudo cargar el detalle de Presupuesto.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuestoDetalle();
  }, [idPresupuesto]);

  return { PresupuestoDetalle, loading, error };
};