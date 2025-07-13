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
        #endregion

        #region Planilla
        List<Planilla> GetPlanilla(string Usuario);
        List<Planilla> GetPlanillabyInfo(int idPlanilla, string Usuario);
        List<Response> InsertPlanilla(Planilla Planilla);
        List<Response> UpdatePlanilla(Planilla Planilla);
        #endregion
    }
}
                