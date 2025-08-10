import { useEffect, useState, useCallback } from 'react';

// API
import { getClientes, getClienteDetalle, updateCliente, insertCliente } from '../api/cliente';

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
  const [clienteDetalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClienteDetalle = useCallback(async () => {
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioStr);
    const correo = encodeURIComponent(user.correo || user.usuario);

    setLoading(true);
    try {
      const data = await getClienteDetalle(correo, idCliente);

      if (Array.isArray(data)) {
        if (data.length === 0) throw new Error('Cliente no encontrado');
        setDetalle(data[0]);
      } else if (data && typeof data === 'object' && data.idCliente) {
        setDetalle(data);
      } else {
        throw new Error('Formato inesperado del API');
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los clientes.');
      setDetalle(null);
    } finally {
      setLoading(false);
    }
  }, [idCliente]);

  useEffect(() => {
    fetchClienteDetalle();
  }, [fetchClienteDetalle]);

  return { clienteDetalle, loading, error, refetch: fetchClienteDetalle };
};


export const useInsertarActualizarCliente = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const guardarcliente = async (Cliente) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      Cliente.idCliente
        ? await updateCliente(Cliente)
        : await insertCliente(Cliente)

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

  return { guardarcliente, loading, error, success }
}