import { http } from './client';

export function getPlanilla(usuario) {
  return http.get('/PlanillaApi/GetPlanilla', { params: { usuario } });
}

export function getPlanillaByInfo(idPlanilla, Usuario) {
  return http.get('/PlanillaApi/GetPlanillabyInfo', { params: { idPlanilla, Usuario } });
}

export function insertPlanilla(body) {
  return http.post('/PlanillaApi/InsertPlanilla', { data: body });
}

export function updatePlanilla(body) {
  return http.put('/PlanillaApi/UpdatePlanilla', { data: body });
}
