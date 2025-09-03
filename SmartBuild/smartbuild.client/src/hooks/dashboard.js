import { useEffect , useState } from 'react';

// API
import { getPresupuestos, getPresupuestoDetalle, insertPresupuesto, updatePresupuesto } from '../api/dashboard';

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
        if (idPresupuesto && idPresupuesto > 0) {
          const data = await getPresupuestoDetalle(correo, idPresupuesto);
          if (Array.isArray(data)) {
              if (data.length === 0) throw new Error('Presupuesto no encontrado')
              setDetalle(data[0])
          } else if (typeof data === 'object' && data.idPresupuesto) {
              setDetalle(data)
          } else {
              throw new Error('Formato inesperado del API')
          }
        } else {
          var data = {
            cliente: { },
            fechaInicio: '',
            fechaFin: '',
            fechaFinReal: '',
            penalizacion: false,
            montoPenalizacion: 0,
            descripcion: '',
            materiaPrimaCotizada: 0,
            manoObraCotizada: 0,
            materiaPrimaCostoReal: 0,
            manoObraCostoReal: 0,
            subContratoCostoReal: 0,
            subContratoCotizado: 0,
            otrosGastos: 0,
            estado: '', 
            montoProyecto: 0
          }

          setDetalle(data)
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los proyectos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuestoDetalle();
  }, [idPresupuesto]);

  return { presupuestoDetalle, loading, error };
};

export const useInsertarActualizarPresupuesto = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const insertarActualizarPresupuesto = async (presupuesto) => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr)
    const correo = encodeURIComponent(user.correo || user.usuario)

    presupuesto.usuario = correo;

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      var res = presupuesto.idPresupuesto && presupuesto.idPresupuesto > 0
        ? await updatePresupuesto(presupuesto)
        : await insertPresupuesto(presupuesto)
      
      setSuccess(true)
      return { res, success: true }; 
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar el presupuesto')
      return false;
    } finally {
      setLoading(false)
    }
  }

  return { insertarActualizarPresupuesto, loading, error, success }
}