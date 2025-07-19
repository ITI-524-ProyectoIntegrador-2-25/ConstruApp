using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models.CRM;
using Models.GNR;
using System.Data;
using System.Data.Common;

namespace DataAccessLogic
{
    public class GNRConnectionDB : IGNRConnectionDB
    {
        private readonly IConfiguration _config;
        private string Connectionstring = "DefaultConnection";

        public GNRConnectionDB(IConfiguration config)
        {
            _config = config;
        }

        #region ConnectionSQL
        private string GetConnectionString()
        {
            return _config.GetConnectionString(Connectionstring);
        }

        public DbConnection GetDbConnection()
        {
            var cnn = new SqlConnection(GetConnectionString());
            return cnn;
        }
        #endregion

        #region CRUD
        public T Get<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
        {
            using (IDbConnection db = new SqlConnection(GetConnectionString()))
            {
                return db.Query<T>(sp, parms, commandType: commandType).FirstOrDefault();
            }
        }

        public List<T> GetAll<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            using (IDbConnection db = new SqlConnection(GetConnectionString()))
            {
                return db.Query<T>(sp, parms, commandType: commandType).ToList();
            }
        }

        public T Insert<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            T result;
            using (IDbConnection db = new SqlConnection(GetConnectionString()))
            {
                try
                {
                    if (db.State == ConnectionState.Closed)
                        db.Open();

                    using (var tran = db.BeginTransaction())
                    {
                        try
                        {
                            result = db.Query<T>(sp, parms, commandType: commandType, transaction: tran).FirstOrDefault();
                            tran.Commit();
                        }
                        catch (Exception ex)
                        {
                            tran.Rollback();
                            throw ex;
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw;
                }
                finally
                {
                    if (db.State == ConnectionState.Open)
                        db.Close();
                }
            }
            return result;
        }

        public T Update<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            T result;
            using (IDbConnection db = new SqlConnection(GetConnectionString()))
            {
                try
                {
                    if (db.State == ConnectionState.Closed)
                        db.Open();

                    using (var tran = db.BeginTransaction())
                    {
                        try
                        {
                            result = db.Query<T>(sp, parms, commandType: commandType, transaction: tran).FirstOrDefault();
                            tran.Commit();
                        }
                        catch (Exception ex)
                        {
                            tran.Rollback();
                            throw ex;
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw;
                }
                finally
                {
                    if (db.State == ConnectionState.Open)
                        db.Close();
                }
            }
            return result;
        }

        public int Execute(string sp, DynamicParameters parms, CommandType commandType = CommandType.StoredProcedure)
        {
            throw new NotImplementedException();
        }
        #endregion

        #region Usuario
        public List<Usuario> GetUsuario(string usuario)
        {
            return GetUsuario("sp_Usuario_001", usuario);
        }

        protected List<Usuario> GetUsuario(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllUsuario");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Usuario>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Usuario> GetUsuariobyInfo(int idUsuario, string usuario)
        {
            return GetUserInfo("sp_Usuario_001", idUsuario, usuario);
        }

        protected List<Usuario> GetUserInfo(string procedure, int idUsuario, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idUsuario), idUsuario);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadUsuarioByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Usuario>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertUsuario(Usuario Usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(Usuario.IDUsuario), Usuario.IDUsuario);
            parameters.Add(nameof(Usuario.Nombre), Usuario.Nombre);
            parameters.Add(nameof(Usuario.Apellido), Usuario.Apellido);
            parameters.Add(nameof(Usuario.Correo), Usuario.Correo);
            parameters.Add(nameof(Usuario.Contrasena), Usuario.Contrasena);
            parameters.Add(nameof(Usuario.Puesto), Usuario.Puesto);
            parameters.Add(nameof(Usuario.Rol), Usuario.Rol);
            parameters.Add(nameof(Usuario.Estado), Usuario.Estado);

            parameters.Add("Usuario", Usuario.Usuario);
            parameters.Add("Sentence", "InsertUsuario");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Usuario_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }

        public List<Response> UpdateUsuario(Usuario Usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(Usuario.IDUsuario), Usuario.IDUsuario);
            parameters.Add(nameof(Usuario.Nombre), Usuario.Nombre);
            parameters.Add(nameof(Usuario.Apellido), Usuario.Apellido);
            parameters.Add(nameof(Usuario.Correo), Usuario.Correo);
            parameters.Add(nameof(Usuario.Contrasena), Usuario.Contrasena);
            parameters.Add(nameof(Usuario.Puesto), Usuario.Puesto);
            parameters.Add(nameof(Usuario.Rol), Usuario.Rol);
            parameters.Add(nameof(Usuario.Estado), Usuario.Estado);

            parameters.Add("Usuario", Usuario.Usuario);
            parameters.Add("Sentence", "UpdateUsuario");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Usuario_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }

        public List<Response> LoginUsuario(string correo, string contrasena)
        {
            return LoginUsuario("sp_Usuario_001", correo, contrasena);
        }

        protected List<Response> LoginUsuario(string procedure, string correo, string contrasena)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("correo", correo);
            parameters.Add("contrasena", contrasena);

            parameters.Add("Usuario", "LoginUsuario");
            parameters.Add("Sentence", "LoadAllUsuario");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }
        #endregion
    }
}
                        