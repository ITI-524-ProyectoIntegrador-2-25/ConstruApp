using Models.CRM;
using Models.GNR;

namespace DataAccessLogic
{
    public interface ICRMConnectionDB : IRepository
    {
        #region Clients
        List<Cliente> GetClients(string usuario);
        List<Cliente> GetClientInfo(int idCliente, string usuario);
        Response InsertClient(Cliente cliente);
        Response UpdateClient(Cliente cliente);
        #endregion
    }
}
