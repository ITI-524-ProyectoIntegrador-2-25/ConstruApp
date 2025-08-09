// src/components/pages/planilla/EditarDetallePlanilla.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Planilla.css'; // Si tienes estilos personalizados, usa este archivo

export default function EditarDetallePlanilla() {
  const { idDetallePlanilla } = useParams(); // Obtener el ID de la URL
  const navigate = useNavigate();
  
  // Estado para manejar los datos y el formulario
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

  // Obtener los datos del detalle de planilla por ID
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`https://smartbuild-001-site1.ktempurl.com/PlanillaDetalleApi/GetPlanillaDetalleByInfo?idPlanillaDetalle=${idDetallePlanilla}&usuario=${localStorage.usuario}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener los datos del detalle');
        }

        const data = await response.json();
        setDetalle(data);
        setForm({
          fecha: data.fecha,
          salarioHora: data.salarioHora,
          horasOrdinarias: data.horasOrdinarias,
          horasExtras: data.horasExtras,
          horasDobles: data.horasDobles
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [idDetallePlanilla]);

  // Manejar los cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar el envío del formulario para actualizar los datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    const usuario = 'usuarioEjemplo'; // Aquí puedes obtener el usuario desde tu sistema (e.g., `localStorage`)

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
      navigate(`/planilla/${idDetallePlanilla}`); // Redirigir a la página de detalles después de la actualización
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!detalle) return null;

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
