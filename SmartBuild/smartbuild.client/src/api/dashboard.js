const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export async function getPresupuestos(correo) {
    const res = await fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${correo}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function getPresupuestoDetalle(correo, id) {
    const res = await fetch(`${API_BASE}/PresupuestoApi/GetPresupuestoByID?idPresupuesto=${id}&usuario=${correo}`)
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}