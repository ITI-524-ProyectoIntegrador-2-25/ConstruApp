using Models.CRM;
using Models.GNR;

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
    }
}
