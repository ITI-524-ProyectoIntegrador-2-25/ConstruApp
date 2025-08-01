const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export async function getActividades(correo) {
    const res = await fetch(`${API_BASE}/ActividadApi/GetActividades?usuario=${correo}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function getActividad(correo, id) {
    const res = await fetch(`${API_BASE}/ActividadApi/GetActividadbyInfo?idCliente=${id}&usuario=${correo}`)
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}


export async function insertActividad(Actividad) {
  const res = await fetch(`${API_BASE}/ActividadApi/InsertActividad`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Actividad),
  });
  if (!res.ok) throw new Error(`Error al insertar: ${res.status}`);
  return await res.json();
}

export async function updateActividad(Actividad) {
    const res = await fetch(`${API_BASE}/ActividadApi/UpdateActividad`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Actividad)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}