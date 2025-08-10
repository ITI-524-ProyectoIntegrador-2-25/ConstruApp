import { http } from './baseAPI';

export function getPlanillaDetalle(usuario) {
  return http.get('/PlanillaDetalleApi/GetPlanillaDetalle', { params: { usuario } });
}

export function getPlanillaDetalleByInfo(idDetallePlanilla, usuario) {
  return http.get('/PlanillaDetalleApi/GetPlanillaDetallebyInfo', {
    params: { idDetallePlanilla: Number(idDetallePlanilla), Usuario: usuario },
  }).then(d => Array.isArray(d) ? d[0] : d);
}

export function insertPlanillaDetalle(body) {
  return http.post('/PlanillaDetalleApi/InsertPlanillaDetalle', { data: body });
}

export function updatePlanillaDetalle(body) {
  return http.put('/PlanillaDetalleApi/UpdatePlanillaDetalle', { data: body });
}
