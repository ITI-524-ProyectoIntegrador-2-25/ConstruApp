import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Planilla.css';

export default function EditarDetallePlanilla() {
  const { idDetallePlanilla } = useParams(); // Obtener el ID de la URL
  const navigate = useNavigate();
  
  const [detalle, setDetalle] = useState(null);
  const [form, setForm] = useState({
    fecha: '',
    salarioHora: '',
    horasOrdinarias: '',
    horasExtras: '',
    horasDobles: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificamos si el componente se monta
  useEffect(() => {
    console.log('Componente EditarDetallePlanilla montado'); // Log para ver si el componente se monta

    if (!idDetallePlanilla) {
      console.error('ID de detalle de planilla no válido:', idDetallePlanilla);
      setError('ID de detalle de planilla no válido');
      setLoading(false);
      return;
    }

    console.log('idDetallePlanilla recibido:', idDetallePlanilla); // Log para verificar el ID recibido

    async function fetchData() {
      console.log('Iniciando fetch de datos...'); // Log antes de hacer el fetch

      try {
        const usuario = localStorage.getItem('usuario'); // Recuperar el usuario desde localStorage
        if (!usuario) {
          console.error('Usuario no autenticado');
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://smartbuild-001-site1.ktempurl.com/PlanillaDetalleApi/GetPlanillaDetalleByInfo?idPlanillaDetalle=${idDetallePlanilla}&usuario=${usuario}`);
        console.log('Respuesta de fetch:', response); // Log para ver si la respuesta es correcta

        if (!response.ok) {
          throw new Error('Error al obtener los datos del detalle');
        }

        const data = await response.json();
        console.log('Datos recibidos de la API:', data); // Log para ver los datos recibidos

        setDetalle(data);
        setForm({
          fecha: data.fecha,
          salarioHora: data.salarioHora,
          horasOrdinarias: data.horasOrdinarias,
          horasExtras: data.horasExtras,
          horasDobles: data.horasDobles
        });
      } catch (error) {
        console.error('Error en fetchData:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [idDetallePlanilla]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usuario = localStorage.getItem('usuario'); // Obtener el usuario de nuevo desde localStorage

    if (!usuario) {
      setError('Usuario no autenticado');
      return;
    }

    const payload = {
      idPlanillaDetalle: idDetallePlanilla,
      fecha: form.fecha,
      salarioHora: form.salarioHora,
      horasOrdinarias: form.horasOrdinarias,
      horasExtras: form.horasExtras,
      horasDobles: form.horasDobles,
      usuario: usuario
    };

    try {
      const response = await fetch(`https://smartbuild-001-site1.ktempurl.com/PlanillaDetalleApi/UpdatePlanillaDetalle?idPlanillaDetalle=${idDetallePlanilla}&usuario=${usuario}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar los datos');
      }

      alert('Datos actualizados correctamente');
      navigate(`/planilla/${idDetallePlanilla}`);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    console.log('Cargando...');
    return <p>Cargando...</p>;
  }

  if (error) {
    console.error('Error:', error);
    return <p>Error: {error}</p>;
  }

  if (!detalle) {
    console.log('No se recibió detalle');
    return null;
  }

  console.log('Detalle cargado:', detalle); // Log para verificar si el detalle es cargado correctamente

  return (
    <div className="editar-detalle-planilla">
      <h1>Editar Detalle de Planilla #{idDetallePlanilla}</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha</label>
          <input 
            type="date" 
            name="fecha" 
            value={form.fecha} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Salario/Hora</label>
          <input 
            type="number" 
            name="salarioHora" 
            value={form.salarioHora} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Horas Ordinarias</label>
          <input 
            type="number" 
            name="horasOrdinarias" 
            value={form.horasOrdinarias} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Horas Extras</label>
          <input 
            type="number" 
            name="horasExtras" 
            value={form.horasExtras} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Horas Dobles</label>
          <input 
            type="number" 
            name="horasDobles" 
            value={form.horasDobles} 
            onChange={handleChange} 
            required 
          />
        </div>

        <button type="submit" className="btn-submit">Guardar Cambios</button>
      </form>
    </div>
  );
}
