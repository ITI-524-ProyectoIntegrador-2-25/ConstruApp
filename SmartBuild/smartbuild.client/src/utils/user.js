// src/utils/user.js
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && (u.correo || u.usuario) ? u : null;
  } catch {
    return null;
  }
}

export function getUsuarioOrThrow() {
  const u = getCurrentUser();
  const usuario = u?.correo || u?.usuario || '';
  if (!usuario) throw new Error('Usuario no autenticado');
  return usuario;
}
