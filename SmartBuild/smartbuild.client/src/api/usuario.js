import { http } from './baseAPI';

export function getUsuarios(usuario, options) {
  return http.get('/UsuarioApi/GetUsuario', {
    params: { usuario },
    ...(options || {}),
  });
}

export function updateUsuario(body, options) {
  return http.put('/UsuarioApi/UpdateUsuario', { data: body, ...(options || {}) });
}
