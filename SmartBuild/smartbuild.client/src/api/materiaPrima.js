const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export async function getMateriaPrima(correo) {
    const res = await fetch(`${API_BASE}/MateriaPrimaApi/GetMateriasPrimas?usuario=${correo}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function insertMateriaPrima(MateriaPrima) {
    console.dir(MateriaPrima)
    const res = await fetch(`${API_BASE}/MateriaPrimaApi/InsertMateriaPrima`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(MateriaPrima),
    });
    if (!res.ok) throw new Error(`Error al insertar: ${res.status}`);
    return await res.json();
}

export async function updateMateriaPrima(MateriaPrima) {
    const res = await fetch(`${API_BASE}/MateriaPrimaApi/UpdateMateriaPrima`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(MateriaPrima)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}