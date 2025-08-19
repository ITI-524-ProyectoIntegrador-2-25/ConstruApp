// src/api/PlanillaDetalle.js
import { http } from './baseAPI';

export function getPlanillaDetalle(usuario, options) {
  return http.get('/PlanillaDetalleApi/GetPlanillaDetalle', {
    params: { usuario },
    ...(options || {}),
  });
}

export async function getPlanillaDetalleByInfo(idDetallePlanilla, usuario, options) {
  const data = await http.get('/PlanillaDetalleApi/GetPlanillaDetallebyInfo', {
    params: { idDetallePlanilla: Number(idDetallePlanilla), Usuario: usuario },
    ...(options || {}),
  });
  return Array.isArray(data) ? (data[0] || null) : (data || null);
}

export function insertPlanillaDetalle(body, options) {
  return http.post('/PlanillaDetalleApi/InsertPlanillaDetalle', { data: body, ...(options || {}) });
}

export function updatePlanillaDetalle(body, options) {
  return http.put('/PlanillaDetalleApi/UpdatePlanillaDetalle', { data: body, ...(options || {}) });
}
