using Models.CRM;
using Models.GNR;

namespace DataAccessLogic
{
    public interface IGNRConnectionDB : IRepository
    {
        #region Usuario
        List<Usuario> GetUsuario(string usuario);
        List<Usuario> GetUsuariobyInfo(int idUsuario, string usuario);
        List<Response> InsertUsuario(Usuario Usuario);
        List<Response> UpdateUsuario(Usuario Usuario);
        List<Response> LoginUsuario(string correo, string contrasena);
        #endregion
    }
}
                