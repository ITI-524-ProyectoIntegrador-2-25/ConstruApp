import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import UserMenu from './UserMenu';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const avatarRef = useRef();

  useEffect(() => {
    function closeOnOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar__logo"></div>
      <div className="navbar__search">
        <input placeholder="Buscar..." />
      </div>
      <div className="navbar__actions">
        <div className="navbar__icon">
          <Bell size={20} />
          <span className="badge">3</span>
        </div>
        <div
          className="navbar__avatar"
          ref={avatarRef}
          onClick={() => setOpen(o => !o)}
        >
          <img src="/assets/img/avatar.jpg" alt="avatar" />
          {open && <UserMenu />}
        </div>
      </div>
    </nav>
  );
}
