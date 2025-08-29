import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, ChevronRight } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Hook
import { useUsuarios, useActualizarUsuario } from '../../../hooks/usuario';
import { getCurrentUser } from '../../../utils/user';

const ROLE_LABELS = {
  manager: "Gestor de proyecto",
  admin: "Administrador",
  employee: "Colaborador"
};

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function UserProfile() {
  const { usuarios, loading, error } = useUsuarios();
  const { actualizarUsuario } = useActualizarUsuario();
  
  const navigate = useNavigate()
  const [users, setUsers] = useState(usuarios);
  const [formData, setFormData] = useState({ nombre: '', correo: '', contrasena: '', puesto: '', rol: 'manager', estado: true });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const resetForm = () => {
    setFormData({ nombre: '', correo: '', contrasena: '', puesto: '', rol: 'manager', estado: true });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.correo || !formData.puesto) return;
    if (!validateEmail(formData.correo)) return;

    formData.idUsuario = editingId;
    const success = await actualizarUsuario(formData);
    if (success) {
      setUsers(prev =>
        prev.map(u => (u.idUsuario === editingId ? { ...u, ...formData } : u))
      );
      resetForm()
    }
  };

  const startEdit = (user) => {
    setEditingId(user.idUsuario);
    setFormData({ nombre: user.nombre, apellido: user.apellido, correo: user.correo, contrasena: '', puesto: user.puesto, rol: user.rol, estado: user.estado });
  };

  const toggleStatus = async (usuario) =>  {
    usuario.estado = ! usuario.estado;
    usuario.contrasena = ''

    const success = await actualizarUsuario(usuario);
    if (success) {
      setUsers(prev => prev.map(u => (u.idUsuario === usuario.idUsuario ? { ...u, estado: usuario.estado } : u)));
    }
  };

  const filteredUsers = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return users.filter(user => {
      const matchesSearch = !term || user.nombre.toLowerCase().includes(term) || user.correo.toLowerCase().includes(term) || user.puesto.toLowerCase().includes(term);
      const matchesRole = roleFilter === 'Todos' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'Todos' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const A = (a[sortKey] ?? '').toString().toLowerCase();
      const B = (b[sortKey] ?? '').toString().toLowerCase();
      if (A < B) return sortDir === 'asc' ? -1 : 1;
      if (A > B) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser?.rol !== 'admin') {
      navigate('/dashboard', {
        state: { error: 'No tienes permisos para acceder al módulo de usuarios.' }
      });
    }

    if (usuarios) {
      setUsers(usuarios);
    }
  }, [usuarios, navigate]);
  useEffect(() => setCurrentPage(1), [debouncedSearch, roleFilter, statusFilter, itemsPerPage]);

  const onHeaderClick = (key) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };
  
  if (loading) return <p>Cargando usuarios…</p>
  if (error) return <p className="dashboard-error">{error}</p>

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link text-secondary" onClick={() => navigate(-1)}><ChevronLeft size={18} className="me-1" />Volver</button>
        <h2>Gestión de usuarios</h2>
      </div>

      <div className="row g-4">
        {editingId && (
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">{'Editar Usuario'}</h5>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-3">
                        <label className="form-label">Apellido</label>
                        <input type='text' name="apellido" className="form-control" value={formData.apellido} onChange={handleInputChange} required />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input type="password" name="contrasena" className="form-control" value={formData.contrasena} onChange={handleInputChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Puesto</label>
                    <input type="text" name="puesto" className="form-control" value={formData.puesto} onChange={handleInputChange} required />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Rol</label>
                      <select name="rol" className="form-select" value={formData.rol} onChange={handleInputChange}>
                        <option value="admin">Administrador</option>
                        <option value="manager">Gestor de proyecto</option>
                        <option value="employee">Colaborador</option>
                      </select>
                    </div>
                    <div className="col">
                      <label className="form-label">Estado</label>
                      <div className="d-flex gap-2">
                        <button type="button" className={`btn btn-sm ${formData.estado ? 'btn-success' : 'btn-outline-secondary'}`} onClick={() => setFormData({...formData, estado: true})}>Activo</button>
                        <button type="button" className={`btn btn-sm ${formData.estado ? 'btn-dark text-white' : 'btn-outline-secondary'}`} onClick={() => setFormData({...formData, estado: false})}>Inactivo</button>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary w-50" onClick={resetForm}>Cancelar</button>
                    <button type="submit" className="btn btn-primary w-50">Actualizar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        <div className={`col-lg-${editingId ? '8' : '12'}`}>
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Usuarios</h5>
                <input type="text" className="form-control w-50" placeholder="Buscar usuarios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <table className="table table-hover">
                <thead>
                  <tr className='text-center'>
                    {['Nombre', 'Apellido', 'Correo', 'Puesto', 'Rol','Estado'].map((col) => (
                      <th key={col} style={{cursor:'pointer'}} onClick={() => onHeaderClick(col)}>{col}</th>
                    ))}
                    <th className='text-center'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u) => (
                    <tr className='text-center' key={u.idUsuario}>
                      <td>{u.nombre}</td>
                      <td>{u.apellido}</td>
                      <td>{u.correo}</td>
                      <td>{u.puesto}</td>
                      <td className='text-center'>
                        <span className="position-tag">
                          {ROLE_LABELS[u.rol] || u.rol}
                        </span>
                      </td>
                      <td>
                        <button className={`btn btn-sm ${u.estado ? 'btn-success' : 'btn-secondary'}`} onClick={() => toggleStatus(u)}>{u.estado ? 'Activo' : 'Inactivo'}</button>
                      </td>
                      <td className='text-center'>
                        <button className="btn btn-sm btn-info me-2" onClick={() => startEdit(u)}><Edit size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center">
                <div>Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios</div>
                <div style={{display: 'flex'}}>
                  <button className="btn btn-outline-secondary btn-sm me-2" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}><ChevronLeft size={14} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} className={`btn btn-sm me-1 ${currentPage===page?'btn-primary':'btn-outline-secondary'}`} onClick={()=>setCurrentPage(page)}>{page}</button>
                  ))}
                  <button className="btn btn-outline-secondary btn-sm" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}><ChevronRight size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
