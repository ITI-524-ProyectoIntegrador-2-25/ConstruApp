// src/components/pages/planilla/Planilla.jsx
import React, { useState } from 'react'
import { ChevronLeft, Calendar, ChevronRight } from 'lucide-react'
import './FormPlanilla.css'
import sampleImg from '../../../assets/img/dashboard.png'  // ajusta la ruta a tu imagen

export default function Planilla() {
  const [date, setDate] = useState(new Date())

  const prevDay = () => setDate(d => {
    const nd = new Date(d)
    nd.setDate(nd.getDate() - 1)
    return nd
  })
  const nextDay = () => setDate(d => {
    const nd = new Date(d)
    nd.setDate(nd.getDate() + 1)
    return nd
  })

  const formatMonthYear = d =>
    d.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="planilla-page">
      {/* HEADER */}
      <header className="planilla-header">
        <button className="back-btn" title="Volver al Dashboard">
          <ChevronLeft size={20}/>
        </button>
        <h1>Planilla</h1>
      </header>

      {/* PERIODO */}
      <section className="planilla-periodo">
        <span className="label">Periodo de la planilla</span>
        <div className="controls">
          <button onClick={prevDay}><ChevronLeft size={18}/></button>
          <Calendar size={18}/>
          <button onClick={nextDay}><ChevronRight size={18}/></button>
        </div>
        <div className="current-period">{formatMonthYear(date)}</div>
      </section>

      {/* CONTENIDO: formulario + resumen */}
      <div className="planilla-grid">
        {/* FORMULARIO */}
        <form className="planilla-form">
          <div className="form-group">
            <label htmlFor="proyecto">Proyecto asociado</label>
            <select id="proyecto">
              <option>Seleccionar proyecto</option>
              <option>Proyecto 1</option>
              <option>Proyecto 2</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="planillaName">Nombre de la planilla</label>
            <input id="planillaName" placeholder="Nombre de la planilla"/>
          </div>

          <div className="form-group">
            <label htmlFor="empleados">Empleados asociados</label>
            <select id="empleados">
              <option>Seleccionar empleados</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="horas">Horas ordinarias</label>
            <input id="horas" placeholder="0"/>
          </div>
          <div className="form-group">
            <label htmlFor="horasExtra">Horas extras</label>
            <input id="horasExtra" placeholder="0"/>
          </div>
          <div className="form-group">
            <label htmlFor="horasDobles">Horas dobles</label>
            <input id="horasDobles" placeholder="0"/>
          </div>
        </form>

        {/* RESUMEN */}
        <aside className="planilla-summary">
          <div className="summary-card">
            <img src={sampleImg} alt="Proyecto" />
            <div className="summary-body">
              <h2>Proyecto 1</h2>
              <span className="tag">Planilla</span>

              <div className="dates">
                <div>
                  <small>Fecha de inicio</small>
                  <strong>15 Ene 2025</strong>
                </div>
                <div>
                  <small>Fecha de finalización</small>
                  <strong>15 Feb 2025</strong>
                </div>
              </div>

              <div className="total">
                <small>Total de horas</small>
                <strong>360</strong>
              </div>

              {/* Texto actualizado aquí */}
              <button className="btn-payment">Generar reporte</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
