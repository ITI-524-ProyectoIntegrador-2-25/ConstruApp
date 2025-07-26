import { useEffect , useState } from 'react';

// API
import { getClientes, getClienteDetalle } from '../api/cliente';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loadingClients, setLoading] = useState(true);
  const [errorClients, setError] = useState('');

  useEffect(() => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr);
    const correo = encodeURIComponent(user.correo || user.usuario);

    const fetchClientes = async () => {
      try {
        const data = await getClientes(correo);
        console.dir(data)
        setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  return { clientes, loadingClients, errorClients };
};

export const useClienteDetalle = (idCliente) => {
  const [clienteDetalle, setDetalle] = useState(null)
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

    const fetchClienteDetalle = async () => {
      try {
        const data = await getClienteDetalle(correo, idCliente);
        console.log('data')
        console.dir(data)
        if (Array.isArray(data)) {
            if (data.length === 0) throw new Error('Cliente no encontrado')
            setDetalle(data[0])
        } else if (typeof data === 'object' && data.idCliente) {
            setDetalle(data)
        } else {
            throw new Error('Formato inesperado del API')
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClienteDetalle();
  }, [idCliente]);

  return { clienteDetalle, loading, error };
};