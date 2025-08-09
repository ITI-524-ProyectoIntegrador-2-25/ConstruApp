import { useEffect , useState } from 'react';

// API
import { getEmpleados, getEmpleado, updateEmpleado, insertEmpleado } from '../api/Empleados';

export const useEmpleados = () => {
  const [Empleados, setEmpleados] = useState([]);
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

    const fetchEmpleados = async () => {
      try {
        const data = await getEmpleados(correo);
         console.log('Empleados:', data); 
        setEmpleados(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las Empleados.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleados();
  }, []);

  return { Empleados, loading, error };
};

export const useEmpleado = (idEmpleado) => {
  const [EmpleadoDetalle, setEmpleado] = useState(null)
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

    const fetchEmpleado = async () => {
      try {
        const data = await getEmpleado(correo, idEmpleado);
        console.log('data')
        console.dir(data)
        if (Array.isArray(data)) {
            if (data.length === 0) throw new Error('Empleado no encontrado')
            setEmpleado(data[0])
        } else if (typeof data === 'object' && data.idEmpleado) {
            setEmpleado(data)
        } else {
            throw new Error('Formato inesperado del API')
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los Empleados.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
  }, [idEmpleado]);

  return { EmpleadoDetalle, loading, error };


  
};

export const useInsertarActualizarEmpleados = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const guardarEmpleado = async (Empleado) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      Empleado.idEmpleado
        ? await updateEmpleado(Empleado)
        : await insertEmpleado(Empleado)

      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar el Emp')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { guardarEmpleado, loading, error, success }
}