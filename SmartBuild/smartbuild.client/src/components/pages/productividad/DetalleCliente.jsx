import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useClienteDetalle } from '../../../hooks/cliente';
import { updateCliente } from '../../../api/cliente';
import '../../../styles/Dashboard.css';
import '../dashboard/FormDashboard.css';

export default function DetalleCliente() {
  const { idCliente } = useParams();
  const navigate = useNavigate();
  
  // Utilizamos el hook para obtener los detalles del cliente
  const { clienteDetalle: detalle, loading, error, refetch } = useClienteDetalle(idCliente);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    razonSocial: '',
    identificacion: '',
    tipo: '',
    nombreContacto: ''
  });
  
  // Inicializar el formulario cuando los detalles del cliente estén disponibles
  useEffect(() => {
    if (detalle) {
      setForm({
        razonSocial: detalle.razonSocial || '',
        identificacion: detalle.identificacion || '',
        tipo: detalle.tipo || '',
        nombreContacto: detalle.nombreContacto || ''
      });
    }
  }, [detalle]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Verificar si hay detalles del cliente
    if (!detalle) {
      console.error('Detalles del cliente no disponibles');
      return;
    }
    
    // Obtener información del usuario
    const usuarioStr = localStorage.getItem('currentUser');
    if (!usuarioStr) return;
    
    const user = JSON.parse(usuarioStr);
    const ahora = new Date().toISOString();
    
    // Construir el payload
    const payload = {
      usuario: user.correo || user.usuario,
      quienIngreso: detalle.quienIngreso || '',
      cuandoIngreso: detalle.cuandoIngreso || '',
      quienModifico: user.correo || user.usuario,
      cuandoModifico: ahora,
      idCliente: detalle.idCliente,
      razonSocial: form.razonSocial,
      identificacion: form.identificacion,
      tipo: form.tipo,
      nombreContacto: form.nombreContacto
    };
    
    try {
      // Actualizar el cliente usando la función de la API
      await updateCliente(payload);
      
      // Actualizar los datos después de la edición
      refetch();
      
      // Salir del modo edición
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar el cliente:', err);
      alert('Error al actualizar el cliente');
    }
  };

  const handleCancel = () => {
    // Restaurar los valores originales al cancelar
    if (detalle) {
      setForm({
        razonSocial: detalle.razonSocial || '',
        identificacion: detalle.identificacion || '',
        tipo: detalle.tipo || '',
        nombreContacto: detalle.nombreContacto || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) return <p className="loading-message">Cargando detalles del cliente...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!detalle) return <p className="alert alert-warning">No se encontró el cliente</p>;

  return (
    <div className="form-dashboard-page" style={{ maxWidth: '900px' }}>
      <div className="form-dashboard-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h1>Cliente #{detalle.idCliente}</h1>
        
        {!isEditing && (
          <button 
            className="btn-submit" 
            style={{ marginLeft: 'auto' }} 
            onClick={() => setIsEditing(true)}
          >
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form 
          className="form-dashboard" 
          onSubmit={handleSubmit}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.5rem' 
          }}
        >
          <div className="form-group">
            <label>Razón social</label>
            <input 
              name="razonSocial" 
              type="text" 
              value={form.razonSocial} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Identificación</label>
            <input 
              name="identificacion" 
              type="text" 
              value={form.identificacion} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Tipo</label>
            <input 
              name="tipo" 
              type="text" 
              value={form.tipo} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Contacto</label>
            <input 
              name="nombreContacto" 
              type="text" 
              value={form.nombreContacto} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div style={{ 
            gridColumn: '1 / -1', 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '1rem' 
          }}>
            <button type="submit" className="btn-submit">
              Guardar cambios
            </button>
            
            <button 
              type="button" 
              className="btn-submit" 
              style={{ background: '#ccc' }} 
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div 
          className="form-dashboard" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.5rem' 
          }}
        >
          <div className="form-group">
            <label>Razón social</label>
            <p className="value">{detalle.razonSocial}</p>
          </div>
          
          <div className="form-group">
            <label>Identificación</label>
            <p className="value">{detalle.identificacion}</p>
          </div>
          
          <div className="form-group">
            <label>Tipo</label>
            <p className="value">{detalle.tipo}</p>
          </div>
          
          <div className="form-group">
            <label>Contacto</label>
            <p className="value">{detalle.nombreContacto}</p>
          </div>
          
          <div className="form-group">
            <label>Registro</label>
            <p className="value">
              {detalle.cuandoIngreso 
                ? new Date(detalle.cuandoIngreso.replace(' ', 'T')).toLocaleDateString() 
                : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}