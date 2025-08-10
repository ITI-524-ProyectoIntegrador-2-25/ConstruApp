const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export async function getGastosAdicionales(correo) {
    const res = await fetch(`${API_BASE}/GastosAdicionalesAPI/GetGastosAdicionales?usuario=${correo}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function insertGastoAdicional(GastoAdicional) {
  const res = await fetch(`${API_BASE}/GastosAdicionalesAPI/InsertGastoAdicional`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(GastoAdicional),
  });
  if (!res.ok) throw new Error(`Error al insertar: ${res.status}`);
  return await res.json();
}

export async function updateGastoAdicional(GastoAdicional) {
    const res = await fetch(`${API_BASE}/GastosAdicionalesAPI/UpdateGastoAdicional`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(GastoAdicional)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function deleteGastoAdicional(GastoAdicional) {
    const res = await fetch(`${API_BASE}/GastosAdicionalesAPI/DeleteGastoAdicional`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(GastoAdicional)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}