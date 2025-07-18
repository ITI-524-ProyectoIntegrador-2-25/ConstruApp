using Models.CRM;
using Models.GNR;
using Models.GPR;

namespace DataAccessLogic
{
    public interface ICRMConnectionDB : IRepository
    {
        #region Clients
        List<Cliente> GetClients(string usuario);
        List<Cliente> GetClientInfo(int idCliente, string usuario);
        List<Response> InsertClient(Cliente cliente);
        List<Response> UpdateClient(Cliente cliente);
        #endregion

        #region Contacts
        List<Contacto> GetContacts(string usuario);
        List<Contacto> GetContactInfo(int idContacto, string usuario);
        List<Response> InsertContact(Contacto contacto);
        List<Response> UpdateContact(Contacto contacto);
        #endregion

        #region Empleado
        List<Empleado> GetEmpleados(string usuario);
        List<Empleado> GetEmpleadobyInfo(int idEmpleado, string usuario);
        List<Response> InsertEmpleado(Empleado Empleado);
        List<Response> UpdateEmpleado(Empleado Empleado);
        #endregion

        #region Usuario
        List<Usuario> GetUsuario(string usuario);
        List<Usuario> GetUsuariobyInfo(int idUsuario, string usuario);
        List<Response> InsertUsuario(Usuario Usuario);
        List<Response> UpdateUsuario(Usuario Usuario);
        List<Response> LoginUsuario(string correo, string contrasena);
        #endregion

        #region Planilla
        List<Planilla> GetPlanilla(string Usuario);
        List<Planilla> GetPlanillabyInfo(int idPlanilla, string Usuario);
        List<Response> InsertPlanilla(Planilla Planilla);
        List<Response> UpdatePlanilla(Planilla Planilla);
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

        #region PagoSubContrato
        List<PagoSubContrato> GetPagosSubcontrato(string usuario);
        List<PagoSubContrato> GetPagoSubcontratoByID(int idPago, string usuario);
        List<Response> InsertPagoSubcontrato(PagoSubContrato pagoSubcontrato);
        List<Response> UpdatePagoSubcontrato(PagoSubContrato pagoSubcontrato);
        #endregion

    }
}
                