import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Edit, User, Mail, Phone, Building } from 'lucide-react';
import { useClienteDetalle } from '../../../hooks/cliente';
import { useContactos } from '../../../hooks/contacto';
import { updateCliente } from '../../../api/cliente';
import { insertContacto, updateContacto } from '../../../api/contacto';
import '../../../styles/Dashboard.css';
import '../dashboard/FormDashboard.css';
import './DetalleCliente.css';

export default function DetalleCliente() {
const { idCliente } = useParams();
const navigate = useNavigate();

const {
  clienteDetalle: detalle,
  loading,
  error,
  refetch: refetchCliente,
} = useClienteDetalle(idCliente);

const {
  contacto: contactos,
  loadingContacts,
  errorContacts,
  refetch: refetchContacts, // <-- agregado para refrescar contactos
} = useContactos();

const [isEditing, setIsEditing] = useState(false);
const [isAddingContact, setIsAddingContact] = useState(false);
const [editingContactId, setEditingContactId] = useState(null);

const [form, setForm] = useState({
  razonSocial: '',
  identificacion: '',
  tipo: '',
  nombreContacto: '',
});

const [contactForm, setContactForm] = useState({
  nombre: '',
  primerApellido: '',
  segundoApellido: '',
  email: '',
  telefono: '',
  esPrincipal: 0,
});

const contactosCliente = contactos.filter(
  (c) => c.clientID === parseInt(idCliente, 10)
);

useEffect(() => {
  if (detalle) {
    setForm({
      razonSocial: detalle.razonSocial || '',
      identificacion: detalle.identificacion || '',
      tipo: detalle.tipo || '',
      nombreContacto: detalle.nombreContacto || '',
    });
  }
}, [detalle]);

const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

const handleContactChange = (e) => {
  const { name, value } = e.target;
  setContactForm((prev) => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!detalle) return;

  const usuarioStr = localStorage.getItem('currentUser');
  if (!usuarioStr) return;
  const user = JSON.parse(usuarioStr);

  const ahora = new Date().toISOString();

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
    nombreContacto: form.nombreContacto,
  };

  try {
    await updateCliente(payload);
    await refetchCliente();
    setIsEditing(false);
  } catch (err) {
    console.error('Error al actualizar el cliente:', err);
  }
};

const handleContactSubmit = async (e) => {
  e.preventDefault();

  const usuarioStr = localStorage.getItem('currentUser');
  if (!usuarioStr) return;
  const user = JSON.parse(usuarioStr);

  const ahora = new Date().toISOString();

  // Si el contacto va a ser principal, primero desmarcar otros contactos principales
  if (contactForm.esPrincipal === 1) {
    const otrosPrincipales = contactosCliente.filter(
      (c) => c.esPrincipal === 1 && c.idContacto !== editingContactId
    );

    for (const contacto of otrosPrincipales) {
      await updateContacto({
        ...contacto,
        esPrincipal: 0,
        usuario: user.correo || user.usuario,
        cuandoModifico: ahora,
      });
    }
  }

  const payload = {
    clientID: parseInt(idCliente, 10),
    nombre: contactForm.nombre || '',
    primerApellido: contactForm.primerApellido || '',
    segundoApellido: contactForm.segundoApellido || '',
    telefono: contactForm.telefono || '',
    correoElectronico: contactForm.email || '',
    esPrincipal: contactForm.esPrincipal || 0,
    usuario: user.correo || user.usuario,
    quienModifico: user.correo || user.usuario,
    cuandoModifico: ahora,
  };

  if (!editingContactId) {
    payload.quienIngreso = user.correo || user.usuario;
    payload.cuandoIngreso = ahora;
  } else {
    payload.idContacto = editingContactId;
  }

  try {
    if (editingContactId) {
      await updateContacto(payload);
    } else {
      await insertContacto(payload);
    }

    await refetchContacts();

    setContactForm({
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      email: '',
      telefono: '',
      esPrincipal: 0,
    });
    setIsAddingContact(false);
    setEditingContactId(null);
  } catch (err) {
    console.error('Error al guardar contacto:', err);
  }
};

const handleCancel = () => {
  if (detalle) {
    setForm({
      razonSocial: detalle.razonSocial || '',
      identificacion: detalle.identificacion || '',
      tipo: detalle.tipo || '',
      nombreContacto: detalle.nombreContacto || '',
    });
  }
  setIsEditing(false);
};

const handleEditContact = (contacto) => {
  setContactForm({
    nombre: contacto.nombre || '',
    primerApellido: contacto.primerApellido || '',
    segundoApellido: contacto.segundoApellido || '',
    email: contacto.correoElectronico || '',
    telefono: contacto.telefono || '',
    esPrincipal: contacto.esPrincipal || 0,
  });
  setEditingContactId(contacto.idContacto);
  setIsAddingContact(true);
};

const handleCancelContact = () => {
  setContactForm({
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    email: '',
    telefono: '',
    esPrincipal: 0,
  });
  setIsAddingContact(false);
  setEditingContactId(null);
};

  if (loading) return <p className="loading-message">Cargando detalles del cliente...</p>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!detalle) return <p className="alert alert-warning">No se encontró el cliente</p>;

return (
  <div className="detalle-cliente-page">
    <div className="detalle-container">
      <div className="detalle-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">
            <ChevronLeft size={20} />
          </button>
          <div className="header-info">
            <h1>{detalle.razonSocial}</h1>
            <p className="client-id">Cliente #{detalle.idCliente}</p>
          </div>
        </div>
        {!isEditing && (
          <button className="btn-edit" onClick={() => setIsEditing(true)} aria-label="Editar cliente">
            <Edit size={16} /> Editar Cliente
          </button>
        )}
      </div>

      <div className="detalle-content">
        {/* Información del Cliente */}
        <section className="info-card" aria-labelledby="cliente-info-title">
          <header className="card-header">
            <h2 id="cliente-info-title">
              <Building size={20} /> Información del Cliente
            </h2>
          </header>

          {isEditing ? (
            <form className="client-form" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="razonSocial">Razón social</label>
                  <input
                    id="razonSocial"
                    name="razonSocial"
                    type="text"
                    value={form.razonSocial}
                    onChange={handleChange}
                    required
                    autoComplete="organization"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="identificacion">Identificación</label>
                  <input
                    id="identificacion"
                    name="identificacion"
                    type="text"
                    value={form.identificacion}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tipo">Tipo</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Publico">Público</option>
                    <option value="Privado">Privado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="nombreContacto">Contacto principal</label>
                  <input
                    id="nombreContacto"
                    name="nombreContacto"
                    type="text"
                    value={form.nombreContacto}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Guardar cambios
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Razón social</label>
                <p>{detalle.razonSocial}</p>
              </div>
              <div className="info-item">
                <label>Identificación</label>
                <p>{detalle.identificacion}</p>
              </div>
              <div className="info-item">
                <label>Tipo</label>
                <p>
                  <span className={`type-badge ${detalle.tipo?.toLowerCase()}`}>
                    {detalle.tipo}
                  </span>
                </p>
              </div>
              <div className="info-item">
                <label>Contacto principal</label>
                <p>{detalle.nombreContacto || 'No especificado'}</p>
              </div>
              <div className="info-item">
                <label>Fecha de registro</label>
                <p>
                  {detalle.cuandoIngreso
                    ? new Date(detalle.cuandoIngreso.replace(' ', 'T')).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div className="info-item">
                <label>Estado</label>
                <p>
                  <span className="status-badge active">Activo</span>
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Contactos del Cliente */}
        <section className="info-card" aria-labelledby="contactos-title">
          <header className="card-header">
            <h2 id="contactos-title">
              <User size={20} /> Contactos del Cliente
            </h2>
            {!isAddingContact && (
              <button
                className="btn-add-contact"
                onClick={() => setIsAddingContact(true)}
                aria-label="Agregar contacto"
              >
                <Plus size={16} /> Agregar Contacto
              </button>
            )}
          </header>

          {isAddingContact && (
            <form className="contact-form" onSubmit={handleContactSubmit} noValidate>
              <h3>{editingContactId ? 'Editar Contacto' : 'Nuevo Contacto'}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={contactForm.nombre}
                    onChange={handleContactChange}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="primerApellido">Primer Apellido</label>
                  <input
                    id="primerApellido"
                    name="primerApellido"
                    value={contactForm.primerApellido}
                    onChange={handleContactChange}
                    autoComplete="family-name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="segundoApellido">Segundo Apellido</label>
                  <input
                    id="segundoApellido"
                    name="segundoApellido"
                    value={contactForm.segundoApellido}
                    onChange={handleContactChange}
                    autoComplete="additional-name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    name="telefono"
                    value={contactForm.telefono}
                    onChange={handleContactChange}
                    autoComplete="tel"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor="esPrincipal">
                    <input
                      type="checkbox"
                      id="esPrincipal"
                      name="esPrincipal"
                      checked={contactForm.esPrincipal === 1}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          esPrincipal: e.target.checked ? 1 : 0,
                        }))
                      }
                    />
                    Contacto Principal
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingContactId ? 'Actualizar' : 'Agregar'} Contacto
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancelContact}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {loadingContacts ? (
            <div className="contacts-loading">Cargando contactos...</div>
          ) : errorContacts ? (
            <div className="contacts-error">{errorContacts}</div>
          ) : contactosCliente.length > 0 ? (
            <div className="contacts-list">
              {contactosCliente.map((contacto) => (
                <article key={contacto.idContacto} className="contact-item">
                  <div className="contact-info">
                    <div className="contact-main">
                      <h4>
                        {contacto.nombre} {contacto.primerApellido} {contacto.segundoApellido}
                        {contacto.esPrincipal === 1 && (
                          <span className="principal-indicator">
                            <span className="principal-light"></span>
                            Principal
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="contact-details">
                      {contacto.correoElectronico && (
                        <div className="contact-detail">
                          <Mail size={14} />
                          <span>{contacto.correoElectronico}</span>
                        </div>
                      )}
                      {contacto.telefono && (
                        <div className="contact-detail">
                          <Phone size={14} />
                          <span>{contacto.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="contact-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEditContact(contacto)}
                      title="Editar contacto"
                      aria-label={`Editar contacto ${contacto.nombre}`}
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-contacts" role="region" aria-live="polite">
              <User size={48} />
              <h3>No hay contactos registrados</h3>
              <p>Agrega el primer contacto para este cliente</p>
            </div>
          )}
        </section>
      </div>
    </div>
  </div>
);

}