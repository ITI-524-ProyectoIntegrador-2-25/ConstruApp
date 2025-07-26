const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export async function getClientes(correo) {
    const res = await fetch(`${API_BASE}/ClientApi/GetClients?usuario=${correo}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function getClienteDetalle(correo, id) {
    const res = await fetch(`${API_BASE}/ClientApi/GetClientInfo?idCliente=${id}&usuario=${correo}`)
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}