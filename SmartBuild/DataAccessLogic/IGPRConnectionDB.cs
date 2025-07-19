using Models.CRM;
using Models.GNR;
using Models.GPR;

namespace DataAccessLogic
{
    public interface IGPRConnectionDB : IRepository
    {
        #region Actividad
        List<Actividad> GetActividades(string usuario);
        List<Actividad> GetActividadbyInfo(int idActividad, string usuario);
        List<Response> InsertActividad(Actividad actividad);
        List<Response> UpdateActividad(Actividad actividad);
        #endregion

        #region Empleado
        List<Empleado> GetEmpleados(string usuario);
        List<Empleado> GetEmpleadobyInfo(int idEmpleado, string usuario);
        List<Response> InsertEmpleado(Empleado Empleado);
        List<Response> UpdateEmpleado(Empleado Empleado);
        #endregion

        #region Planilla
        List<Planilla> GetPlanilla(string Usuario);
        List<Planilla> GetPlanillabyInfo(int idPlanilla, string Usuario);
        List<Response> InsertPlanilla(Planilla Planilla);
        List<Response> UpdatePlanilla(Planilla Planilla);
        #endregion

        #region PlanillaDetalle
        List<PlanillaDetalle> GetPlanillasDetalle(string Usuario);
        List<PlanillaDetalle> GetPlanillaDetallebyInfo(int idPlanilla, string Usuario);
        List<Response> InsertPlanillaDetalle(PlanillaDetalle planillaDetalle);
        List<Response> UpdatePlanillaDetalle(PlanillaDetalle planillaDetalle);
        #endregion

        #region Presupuesto
        List<Presupuesto> GetPresupuestos(string usuario);
        List<Presupuesto> GetPresupuestoByID(int idPresupuesto, string usuario);
        List<Response> InsertPresupuesto(Presupuesto presupuesto);
        List<Response> UpdatePresupuesto(Presupuesto presupuesto);
        #endregion

        #region GastoAdicional
        List<GastoAdicional> GetGastosAdicionales(string usuario);
        List<GastoAdicional> GetGastoAdicionalByID(int idGasto, string usuario);
        List<Response> InsertGastoAdicional(GastoAdicional gasto);
        List<Response> UpdateGastoAdicional(GastoAdicional gasto);
        #endregion

        #region MateriaPrima
        List<MateriaPrima> GetMateriasPrimas(string usuario);
        List<MateriaPrima> GetMateriaPrimaByID(int idMateriaPrima, string usuario);
        List<Response> InsertMateriaPrima(MateriaPrima materiaPrima);
        List<Response> UpdateMateriaPrima(MateriaPrima materiaPrima);

        #endregion

        #region SubContrato
        List<SubContrato> GetSubcontratos(string usuario);
        List<SubContrato> GetSubcontratoByID(int idSubcontrato, string usuario);
        List<Response> InsertSubcontrato(SubContrato subContrato);
        List<Response> UpdateSubcontrato(SubContrato subContrato);
        #endregion

        #region PagoSubContrato
        List<PagoSubContrato> GetPagosSubcontrato(string usuario);
        List<PagoSubContrato> GetPagoSubcontratoByID(int idPago, string usuario);
        List<Response> InsertPagoSubcontrato(PagoSubContrato pagoSubcontrato);
        List<Response> UpdatePagoSubcontrato(PagoSubContrato pagoSubcontrato);
        #endregion
    }
}
                