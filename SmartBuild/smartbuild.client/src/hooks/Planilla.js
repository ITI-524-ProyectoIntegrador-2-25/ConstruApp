import { useEffect, useState } from 'react';

// API
import { getPlanilla } from '../api/Planilla'
import { getPlanillaDetalle } from '../api/PlanillaDetalle'

export const usePlanillas = () => {
  const [Planillas, setPlanillas] = useState([]);
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

    const fetchPlanillas = async () => {
      try {
        const data = await getPlanilla(correo);
        setPlanillas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las planillas.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanillas();
  }, []);

  return { Planillas, loading, error };
};

export const usePlanillaDetalle = (idPlanilla) => {
  const [planillaDetalle, setDetalle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!idPlanilla) {
      setError('ID de planilla no válido');
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

    const fetchPlanillaDetalle = async () => {
      try {
        const data = await getPlanillaDetalle(correo, idPlanilla)
        
        if (Array.isArray(data)) {
          if (data.length === 0) throw new Error('Planilla no encontrada')
          setDetalle(data[0])
        } else if (typeof data === 'object' && data.idPlanilla) {
          setDetalle(data)
        } else {
          throw new Error('Formato inesperado del API')
        }
      } catch (err) {
        console.error('Error al cargar planilla detalle:', err);
        setError('No se pudo cargar el detalle de la planilla.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanillaDetalle();
  }, [idPlanilla]);

  return { planillaDetalle, loading, error };
};