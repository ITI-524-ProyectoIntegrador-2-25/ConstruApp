import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function UserMenu() {
  return (
    <div className="usermenu">
      <Link to="/dashboard/usuario">Perfil</Link>
      <Link to="/dashboard/usuario/editar">Editar Perfil</Link>
      <hr/>
      <button><LogOut size={16}/> Cerrar sesión</button>
    </div>
  );
}
