using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models.CRM;
using Models.GNR;
using System.Data;
using System.Data.Common;

namespace DataAccessLogic
{
    public class CRMConnectionDB : ICRMConnectionDB
    {
        private readonly IConfiguration _config;
        private string Connectionstring = "DefaultConnection";

        public CRMConnectionDB(IConfiguration config)
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

        #region Clients
        public List<Cliente> GetClients(string usuario)
        {
            return GetClients("sp_Cliente_001", usuario);
        }

        protected List<Cliente> GetClients(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllClientes");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Cliente>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Cliente> GetClientInfo(int idCliente, string usuario)
        {
            return GetClientInfo("sp_Cliente_001", idCliente, usuario);
        }

        protected List<Cliente> GetClientInfo(string procedure, int idCliente, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idCliente), idCliente);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadClienteByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Cliente>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public Response InsertClient(Cliente cliente)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(cliente.IDCliente), cliente.IDCliente);
            parameters.Add(nameof(cliente.RazonSocial), cliente.RazonSocial);
            parameters.Add(nameof(cliente.Identificacion), cliente.Identificacion);

            parameters.Add("Usuario", cliente.Usuario);
            parameters.Add("Sentence", "InsertClient");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Cliente_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return (Response)response;
        }

        public Response UpdateClient(Cliente cliente)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(cliente.IDCliente), cliente.IDCliente);
            parameters.Add(nameof(cliente.RazonSocial), cliente.RazonSocial);
            parameters.Add(nameof(cliente.Identificacion), cliente.Identificacion);

            parameters.Add("Usuario", cliente.Usuario);
            parameters.Add("Sentence", "UpdateCliente");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Cliente_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return (Response)response;
        }
        #endregion
    }
}
