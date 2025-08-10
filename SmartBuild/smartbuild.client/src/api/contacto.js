const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export async function getContacto(correo) {
    const res = await fetch(`${API_BASE}/ContactApi/GetContacts?usuario=${correo}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function getContactoDetalle(correo, id) {
    const res = await fetch(`${API_BASE}/ContactApi/GetContactInfo?idContacto=${id}&usuario=${correo}`)
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function insertContacto(cliente) {
  const res = await fetch(`${API_BASE}/ContactApi/InsertContact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) throw new Error(`Error al insertar: ${res.status}`);
  return await res.json();
}

export async function updateContacto(cliente) {
  const res = await fetch(`${API_BASE}/ContactApi/UpdateContact`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!res.ok) throw new Error(`Error al actualizar: ${res.status}`);
  return await res.json();
}