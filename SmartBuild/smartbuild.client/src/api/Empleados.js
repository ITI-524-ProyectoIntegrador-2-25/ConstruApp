const API_BASE = 'https://smartbuild-001-site1.ktempurl.com'

export async function getEmpleados(correo) {
    const res = await fetch(`${API_BASE}/EmpleadoApi/GetEmpleado?usuario=${correo}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}

export async function getEmpleado(correo, id) {
    const res = await fetch(`${API_BASE}/EmpleadoApi/GetEmpleadoInfo?idEmpleado=${id}&usuario=${correo}`)
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}


export async function insertEmpleado(Empleado) {
  const res = await fetch(`${API_BASE}/EmpleadoApi/InsertEmpleado`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Empleado),
  });
  if (!res.ok) throw new Error(`Error al insertar: ${res.status}`);
  return await res.json();
}

export async function updateEmpleado(Empleado) {
    const res = await fetch(`${API_BASE}/EmpleadoApi/UpdateEmpleado`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Empleado)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
}