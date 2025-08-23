// src/api/Planilla.js
import { http } from './baseAPI';

export function getPlanilla(usuario, options) {
  return http.get('/PlanillaApi/GetPlanilla', {
    params: { usuario },
    ...(options || {}),
  });
}

export async function getPlanillaByInfo(idPlanilla, usuario, options) {
  const data = await http.get('/PlanillaApi/GetPlanillabyInfo', {
    params: { idPlanilla: Number(idPlanilla), Usuario: usuario }, // el backend usa "Usuario"
    ...(options || {}),
  });
  if (Array.isArray(data)) return data[0] || null;
  return data || null;
}

export function insertPlanilla(body, options) {
  return http.post('/PlanillaApi/InsertPlanilla', { data: body, ...(options || {}) });
}

export function updatePlanilla(body, options) {
  return http.put('/PlanillaApi/UpdatePlanilla', { data: body, ...(options || {}) });
}
