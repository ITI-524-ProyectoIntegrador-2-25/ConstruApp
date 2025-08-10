import { useEffect, useState, useCallback } from 'react';
import { getContacto, getContactoDetalle,insertContacto,updateContacto } from '../api/contacto';

export const useContactos = () => {
  const [contacto, setContacto] = useState([]);
  const [loadingContacts, setLoading] = useState(true);
  const [errorContacts, setError] = useState('');

  const fetchContactos = useCallback(async () => {
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
      const data = await getContacto(correo);
      setContacto(Array.isArray(data) ? [...data] : []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los contactos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContactos();
  }, [fetchContactos]);

  return { contacto, loadingContacts, errorContacts, refetch: fetchContactos };
};

export const useContactoDetalle = (idContacto) => {
  const [contactoDetalle, setDetalle] = useState(null);
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

    const fetchContactoDetalle = async () => {
      try {
        const data = await getContactoDetalle(correo, idContacto);
        if (Array.isArray(data)) {
          if (data.length === 0) throw new Error('Contacto no encontrado');
          setDetalle(data[0]);
        } else if (typeof data === 'object' && data.idContacto) {
          setDetalle(data);
        } else {
          throw new Error('Formato inesperado del API');
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los contactos.');
      } finally {
        setLoading(false);
      }
    };

    fetchContactoDetalle();
  }, [idContacto]);

  return { contactoDetalle, loading, error };
};


export const useInsertarActualizarContacto = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const guardarContacto = async (contacto) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      contacto.idContacto
        ? await updateContacto(contacto)
        : await insertContacto(contacto)

      setSuccess(true)
      return true
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al guardar el Contacto')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { guardarContacto, loading, error, success }
}