const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export async function getPlanilla(correo) {
    const res = await fetch(`${API_BASE}/PlanillaApi/GetPlanilla?usuario=${correo}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function getPlanillaDetalle(correo, id) {
    const res = await fetch(`${API_BASE}/PlanillaApi/GetPlanillabyInfo?idPlanilla=${id}&usuario=${correo}`)
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function insertPlanilla(payload) {
  const res = await fetch(`${API_BASE}/PlanillaApi/InsertPlanilla`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Nuevo: actualiza una planilla existente
export async function updatePlanilla(payload) {
  const res = await fetch(`${API_BASE}/PlanillaApi/UpdatePlanilla`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}