using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models.CRM;
using Models.GNR;
using Models.GPR;
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

        public List<Response> InsertClient(Cliente cliente)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(cliente.IDCliente), cliente.IDCliente);
            parameters.Add(nameof(cliente.RazonSocial), cliente.RazonSocial);
            parameters.Add(nameof(cliente.Identificacion), cliente.Identificacion);
            parameters.Add(nameof(cliente.Tipo), cliente.Tipo);

            parameters.Add("Usuario", cliente.Usuario);
            parameters.Add("Sentence", "InsertCliente");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Cliente_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }

        public List<Response> UpdateClient(Cliente cliente)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(cliente.IDCliente), cliente.IDCliente);
            parameters.Add(nameof(cliente.RazonSocial), cliente.RazonSocial);
            parameters.Add(nameof(cliente.Identificacion), cliente.Identificacion);
            parameters.Add(nameof(cliente.Tipo), cliente.Tipo);

            parameters.Add("Usuario", cliente.Usuario);
            parameters.Add("Sentence", "UpdateCliente");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Cliente_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }
        #endregion

        #region Contacts
        public List<Contacto> GetContacts(string usuario)
        {
            return GetContacts("sp_Contacto_001", usuario);
        }

        protected List<Contacto> GetContacts(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllContactos");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Contacto>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Contacto> GetContactInfo(int idContacto, string usuario)
        {
            return GetContactInfo("sp_Contacto_001", idContacto, usuario);
        }

        protected List<Contacto> GetContactInfo(string procedure, int idContacto, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idContacto), idContacto);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadContactoByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Contacto>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertContact(Contacto contacto)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(contacto.IDContacto), contacto.IDContacto);
            parameters.Add(nameof(contacto.ClientID), contacto.ClientID);
            parameters.Add(nameof(contacto.SubcontratoID), contacto.SubcontratoID);
            parameters.Add(nameof(contacto.Nombre), contacto.Nombre);
            parameters.Add(nameof(contacto.PrimerApellido), contacto.PrimerApellido);
            parameters.Add(nameof(contacto.SegundoApellido), contacto.SegundoApellido);
            parameters.Add(nameof(contacto.Telefono), contacto.Telefono);
            parameters.Add(nameof(contacto.CorreoElectronico), contacto.CorreoElectronico);
            parameters.Add(nameof(contacto.EsPrincipal), contacto.EsPrincipal);

            parameters.Add("Usuario", contacto.Usuario);
            parameters.Add("Sentence", "InsertContacto");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Contacto_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }

        public List<Response> UpdateContact(Contacto contacto)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(contacto.IDContacto), contacto.IDContacto);
            parameters.Add(nameof(contacto.Nombre), contacto.Nombre);
            parameters.Add(nameof(contacto.PrimerApellido), contacto.PrimerApellido);
            parameters.Add(nameof(contacto.SegundoApellido), contacto.SegundoApellido);
            parameters.Add(nameof(contacto.Telefono), contacto.Telefono);
            parameters.Add(nameof(contacto.CorreoElectronico), contacto.CorreoElectronico);
            parameters.Add(nameof(contacto.EsPrincipal), contacto.EsPrincipal);

            parameters.Add("Usuario", contacto.Usuario);
            parameters.Add("Sentence", "UpdateContacto");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Contacto_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }
        #endregion
    }
}
                        