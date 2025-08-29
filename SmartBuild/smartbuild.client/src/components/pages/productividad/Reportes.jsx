import React, { useState, useEffect } from "react";
import Select from "react-select";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Reportes.css";

const API_BASE = "https://smartbuild-001-site1.ktempurl.com";

export default function Reportes() {
  const [presupuestosOpts, setPresupuestosOpts] = useState([]);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  const [presupuestoDetalle, setPresupuestoDetalle] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [gastosAdicionales, setGastosAdicionales] = useState([]);
  const [planillaDetalle, setPlanillaDetalle] = useState([]);
  const [detalleCliente, setDetalleCliente] = useState(null);

  const [includePresupuesto, setIncludePresupuesto] = useState(true);
  const [includeActividades, setIncludeActividades] = useState(true);
  const [includeGastos, setIncludeGastos] = useState(true);
  const [includePlanilla, setIncludePlanilla] = useState(true);

  const [expandedSections, setExpandedSections] = useState({
    presupuesto: true,
    actividades: true,
    gastos: true,
    planilla: true,
  });

  // Fechas de filtro
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Copias sin filtro
  const [rawActividades, setRawActividades] = useState([]);
  const [rawGastos, setRawGastos] = useState([]);
  const [rawPlanilla, setRawPlanilla] = useState([]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(amount ?? 0);

  // Presupuestos (combo)
  useEffect(() => {
    const usr = localStorage.getItem("currentUser");
    if (!usr) return;
    const { correo, usuario } = JSON.parse(usr);
    const usuarioParam = encodeURIComponent(correo || usuario);

    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestos?usuario=${usuarioParam}`)
      .then((res) => res.json())
      .then((data) =>
        setPresupuestosOpts(
          (data || []).map((p) => ({ value: p.idPresupuesto, label: p.descripcion }))
        )
      )
      .catch(console.error);
  }, []);

  // Carga de datos por presupuesto
  useEffect(() => {
    if (!selectedPresupuesto) return;
    const id = selectedPresupuesto.value;
    const usr = localStorage.getItem("currentUser");
    if (!usr) return;
    const { correo, usuario } = JSON.parse(usr);
    const usuarioParam = encodeURIComponent(correo || usuario);

    // Presupuesto
    fetch(`${API_BASE}/PresupuestoApi/GetPresupuestoByID?idPresupuesto=${id}&usuario=${usuarioParam}`)
      .then((res) => res.json())
      .then((data) => {
        const p = Array.isArray(data) ? data[0] : data;
        setPresupuestoDetalle(p);
        setDetalleCliente({ nombre: p?.nombreCliente });
      })
      .catch(console.error);

    // Actividades
    fetch(`${API_BASE}/ActividadApi/GetActividades?presupuestoID=${id}&usuario=${usuarioParam}`)
      .then((res) => res.json())
      .then((data) => {
        const arr = data || [];
        setRawActividades(arr);
        setActividades(arr);
      })
      .catch(console.error);

    // Gastos adicionales
    fetch(`${API_BASE}/GastosAdicionalesApi/GetGastosAdicionales?presupuestoID=${id}&usuario=${usuarioParam}`)
      .then((res) => res.json())
      .then((data) => {
        const arr = data || [];
        setRawGastos(arr);
        setGastosAdicionales(arr);
      })
      .catch(console.error);

    // Planilla detalle
    fetch(`${API_BASE}/PlanillaDetalleApi/GetPlanillaDetalle?usuario=${usuarioParam}`)
      .then((res) => res.json())
      .then((data) => {
        const filtrado = (data || []).filter((p) => p.presupuestoID === id);
        setRawPlanilla(filtrado);
        setPlanillaDetalle(filtrado);
      })
      .catch(console.error);
  }, [selectedPresupuesto]);

  // =================== FILTROS ===================
  const applyFilters = () => {
    // Normalizamos fechas a 00:00:00 y 23:59:59 para incluir bordes
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

    const inRange = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    };

    // Para actividades consideramos "solape" del rango actividad con el filtro
    const overlaps = (startStr, endStr) => {
      const aStart = startStr ? new Date(startStr) : null;
      const aEnd = endStr ? new Date(endStr) : null;

      // Si no hay filtro, no filtramos
      if (!start && !end) return true;

      // Si la actividad no tiene fin, usamos solo inicio
      if (aStart && !aEnd) return inRange(aStart.toISOString());

      // Si la actividad no tiene inicio, intentamos con fin
      if (!aStart && aEnd) return inRange(aEnd.toISOString());

      // Si no hay fechas en la actividad, no pasa
      if (!aStart && !aEnd) return false;

      // Rango de filtro [F1,F2], actividad [A1,A2] => hay solape si A1<=F2 y A2>=F1
      const F1 = start || new Date(-8640000000000000); // -INF
      const F2 = end || new Date(8640000000000000);   // +INF
      return aStart <= F2 && aEnd >= F1;
    };

    setActividades(
      rawActividades.filter((a) =>
        overlaps(a.fechaInicioProyectada, a.fechaFinProyectada)
      )
    );
    setGastosAdicionales(rawGastos.filter((g) => inRange(g.fecha)));
    setPlanillaDetalle(rawPlanilla.filter((p) => inRange(p.fecha)));
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setActividades(rawActividades);
    setGastosAdicionales(rawGastos);
    setPlanillaDetalle(rawPlanilla);
  };

  // =================== EXPORTAR EXCEL ===================
  const handleExportExcel = () => {
    if (!presupuestoDetalle) return;
    const wb = XLSX.utils.book_new();

    if (includePresupuesto) {
      const sheet = [
        {
          Descripción: presupuestoDetalle.descripcion,
          Cliente: detalleCliente?.nombre || "N/A",
          "Fecha inicio": presupuestoDetalle.fechaInicio?.slice(0, 10),
          "Fecha fin": presupuestoDetalle.fechaFin?.slice(0, 10),
          "Monto proyecto": formatCurrency(presupuestoDetalle.montoProyecto),
          Penalización: presupuestoDetalle.penalizacion ? "Sí" : "No",
          "Monto penalización": formatCurrency(presupuestoDetalle.montoPenalizacion),
          ...(startDate || endDate
            ? { "Filtro fechas": `Desde ${startDate || "-"} hasta ${endDate || "-"}` }
            : {}),
        },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet), "Presupuesto");
    }

    if (includeActividades && actividades.length > 0) {
      const sheet = actividades.map((a) => ({
        Descripción: a.descripcion,
        "Fecha inicio": a.fechaInicioProyectada?.slice(0, 10),
        "Fecha fin": a.fechaFinProyectada?.slice(0, 10),
        Estado: a.estado,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet), "Actividades");
    }

    if (includeGastos && gastosAdicionales.length > 0) {
      const sheet = gastosAdicionales.map((g) => ({
        Fecha: g.fecha?.slice(0, 10),
        Descripción: g.descripcion,
        Monto: formatCurrency(g.monto),
        Estado: g.estadoPago,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet), "Gastos");
    }

    if (includePlanilla && planillaDetalle.length > 0) {
      const sheet = planillaDetalle.map((p) => {
        const totalOrdinario = (p.horasOrdinarias ?? 0) * (p.salarioHora ?? 0);
        const totalExtra = (p.horasExtras ?? 0) * (p.salarioHora ?? 0) * 1.5;
        const totalDobles = (p.horasDobles ?? 0) * (p.salarioHora ?? 0) * 2;
        const total = totalOrdinario + totalExtra + totalDobles;

        return {
          Fecha: p.fecha?.slice(0, 10),
          EmpleadoID: p.empleadoID,
          "Salario/Hora": formatCurrency(p.salarioHora),
          "Horas ordinarias": p.horasOrdinarias,
          "Horas extras": p.horasExtras,
          "Horas dobles": p.horasDobles,
          Total: formatCurrency(total),
          Detalle: p.detalle,
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet), "PlanillaDetalle");
    }

    XLSX.writeFile(wb, `Reporte_Presupuesto_${presupuestoDetalle.idPresupuesto}.xlsx`);
  };

  // =================== EXPORTAR PDF ===================
const handleExportPDF = async () => {
  if (!presupuestoDetalle) return;

  // Importación dinámica (solo cuando se ejecuta esta función)
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  let y = 12;

  // Encabezado general
  doc.setFontSize(16);
  doc.text(
    `Reporte Presupuesto ${presupuestoDetalle.idPresupuesto ?? ""}`,
    14,
    y
  );
  y += 6;
  doc.setFontSize(11);
  doc.text(`Cliente: ${detalleCliente?.nombre || "N/A"}`, 14, y);
  y += 6;
  if (startDate || endDate) {
    doc.text(`Filtro: desde ${startDate || "-"} hasta ${endDate || "-"}`, 14, y);
    y += 6;
  }
  y += 2;

  if (includePresupuesto) {
    doc.setFontSize(14);
    doc.text("Presupuesto", 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Campo", "Valor"]],
      body: [
        ["Descripción", presupuestoDetalle.descripcion],
        ["Fecha inicio", presupuestoDetalle.fechaInicio?.slice(0, 10)],
        ["Fecha fin", presupuestoDetalle.fechaFin?.slice(0, 10)],
        ["Monto proyecto", formatCurrency(presupuestoDetalle.montoProyecto)],
        ["Penalización", presupuestoDetalle.penalizacion ? "Sí" : "No"],
        ["Monto penalización", formatCurrency(presupuestoDetalle.montoPenalizacion)],
      ],
      theme: "grid",
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (includeActividades && actividades.length > 0) {
    doc.setFontSize(14);
    doc.text("Actividades", 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Descripción", "Fecha inicio", "Fecha fin", "Estado"]],
      body: actividades.map((a) => [
        a.descripcion,
        a.fechaInicioProyectada?.slice(0, 10),
        a.fechaFinProyectada?.slice(0, 10),
        a.estado,
      ]),
      theme: "grid",
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (includeGastos && gastosAdicionales.length > 0) {
    doc.setFontSize(14);
    doc.text("Gastos Adicionales", 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Descripción", "Monto", "Estado"]],
      body: gastosAdicionales.map((g) => [
        g.fecha?.slice(0, 10),
        g.descripcion,
        formatCurrency(g.monto),
        g.estadoPago,
      ]),
      theme: "grid",
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (includePlanilla && planillaDetalle.length > 0) {
    doc.setFontSize(14);
    doc.text("Planilla Detalle", 14, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [[
        "Fecha", "EmpleadoID", "Salario/Hora",
        "Horas ordinarias", "Horas extras", "Horas dobles",
        "Total", "Detalle"
      ]],
      body: planillaDetalle.map((p) => {
        const total =
          (p.horasOrdinarias ?? 0) * (p.salarioHora ?? 0) +
          (p.horasExtras ?? 0) * (p.salarioHora ?? 0) * 1.5 +
          (p.horasDobles ?? 0) * (p.salarioHora ?? 0) * 2;
        return [
          p.fecha?.slice(0, 10),
          p.empleadoID,
          formatCurrency(p.salarioHora),
          p.horasOrdinarias,
          p.horasExtras,
          p.horasDobles,
          formatCurrency(total),
          p.detalle,
        ];
      }),
      theme: "grid",
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    });
  }

  // Guardar PDF
  doc.save(`Reporte_Presupuesto_${presupuestoDetalle.idPresupuesto}.pdf`);
};

  const toggleSection = (sec) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  return (
    <div className="reportes-page">
      <h2>Reportes de Productividad</h2>

      <div className="select-wrapper">
        <Select
          options={presupuestosOpts}
          value={selectedPresupuesto}
          onChange={setSelectedPresupuesto}
          placeholder="Seleccionar presupuesto..."
        />
      </div>

      {/* Filtros */}
      <div style={{ margin: "12px 0", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <label>Desde: <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
        <label>Hasta: <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
        <button className="btn-action" onClick={applyFilters}>Aplicar filtros</button>
        <button className="btn-action" onClick={clearFilters} style={{ background: "#888" }}>Limpiar filtros</button>
      </div>

      {presupuestoDetalle && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
            <button className="btn-action" onClick={handleExportExcel}>
              Exportar a Excel
            </button>
            <button className="btn-action" onClick={handleExportPDF}>
              Exportar a PDF
            </button>
          </div>

          {/* Presupuesto */}
          <div className="accordion-card">
            <div className="accordion-header" onClick={() => toggleSection("presupuesto")}>
              <h3>Presupuesto</h3>
              <label>
                <input
                  type="checkbox"
                  checked={includePresupuesto}
                  onChange={(e) => setIncludePresupuesto(e.target.checked)}
                /> Incluir en Excel/PDF
              </label>
            </div>
            {expandedSections.presupuesto && (
              <table className="modern-table">
                <tbody>
                  <tr><th>Descripción</th><td>{presupuestoDetalle.descripcion}</td></tr>
                  <tr><th>Cliente</th><td>{detalleCliente?.nombre || "N/A"}</td></tr>
                  <tr><th>Fecha inicio</th><td>{presupuestoDetalle.fechaInicio?.slice(0, 10)}</td></tr>
                  <tr><th>Fecha fin</th><td>{presupuestoDetalle.fechaFin?.slice(0, 10)}</td></tr>
                  <tr><th>Monto proyecto</th><td>{formatCurrency(presupuestoDetalle.montoProyecto)}</td></tr>
                  <tr><th>Penalización</th><td>{presupuestoDetalle.penalizacion ? "Sí" : "No"}</td></tr>
                  <tr><th>Monto penalización</th><td>{formatCurrency(presupuestoDetalle.montoPenalizacion)}</td></tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Actividades */}
          <div className="accordion-card">
            <div className="accordion-header" onClick={() => toggleSection("actividades")}>
              <h3>Actividades</h3>
              <label>
                <input
                  type="checkbox"
                  checked={includeActividades}
                  onChange={(e) => setIncludeActividades(e.target.checked)}
                /> Incluir en Excel/PDF
              </label>
            </div>
            {expandedSections.actividades && (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Descripción</th><th>Fecha inicio</th><th>Fecha fin</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {actividades.map((a) => (
                    <tr key={a.idActividad}>
                      <td>{a.descripcion}</td>
                      <td>{a.fechaInicioProyectada?.slice(0, 10)}</td>
                      <td>{a.fechaFinProyectada?.slice(0, 10)}</td>
                      <td>{a.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Gastos Adicionales */}
          <div className="accordion-card">
            <div className="accordion-header" onClick={() => toggleSection("gastos")}>
              <h3>Gastos Adicionales</h3>
              <label>
                <input
                  type="checkbox"
                  checked={includeGastos}
                  onChange={(e) => setIncludeGastos(e.target.checked)}
                /> Incluir en Excel/PDF
              </label>
            </div>
            {expandedSections.gastos && (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Descripción</th><th>Monto</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {gastosAdicionales.map((g) => (
                    <tr key={g.idGasto}>
                      <td>{g.fecha?.slice(0, 10)}</td>
                      <td>{g.descripcion}</td>
                      <td>{formatCurrency(g.monto)}</td>
                      <td>{g.estadoPago}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Planilla Detalle */}
          <div className="accordion-card">
            <div className="accordion-header" onClick={() => toggleSection("planilla")}>
              <h3>Planilla Detalle</h3>
              <label>
                <input
                  type="checkbox"
                  checked={includePlanilla}
                  onChange={(e) => setIncludePlanilla(e.target.checked)}
                /> Incluir en Excel/PDF
              </label>
            </div>
            {expandedSections.planilla && (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>EmpleadoID</th><th>Salario/Hora</th>
                    <th>Horas ordinarias</th><th>Horas extras</th><th>Horas dobles</th>
                    <th>Total</th><th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {planillaDetalle.map((p) => {
                    const total =
                      (p.horasOrdinarias ?? 0) * (p.salarioHora ?? 0) +
                      (p.horasExtras ?? 0) * (p.salarioHora ?? 0) * 1.5 +
                      (p.horasDobles ?? 0) * (p.salarioHora ?? 0) * 2;
                    return (
                      <tr key={p.idDetallePlanilla}>
                        <td>{p.fecha?.slice(0, 10)}</td>
                        <td>{p.empleadoID}</td>
                        <td>{formatCurrency(p.salarioHora)}</td>
                        <td>{p.horasOrdinarias}</td>
                        <td>{p.horasExtras}</td>
                        <td>{p.horasDobles}</td>
                        <td>{formatCurrency(total)}</td>
                        <td>{p.detalle}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

