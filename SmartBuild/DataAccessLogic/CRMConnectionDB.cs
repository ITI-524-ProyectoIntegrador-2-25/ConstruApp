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

            parameters.Add("Usuario", contacto.Usuario);
            parameters.Add("Sentence", "UpdateContacto");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Contacto_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }
        #endregion


        #region Empleados
        public List<Empleado> GetEmpleados(string usuario)
        {
            return GetEmpleado("sp_Empleado_001", usuario);
        }

        protected List<Empleado> GetEmpleado(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters(); 
            

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllEmpleado");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Empleado>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Empleado> GetEmpleadobyInfo(int idEmpleado, string usuario)
        {
            return GetEmpleadobyInfo("sp_Empleado_001", idEmpleado, usuario);
        }

        protected List<Empleado> GetEmpleadobyInfo(string procedure, int idEmpleado, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idEmpleado), idEmpleado);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadEmpleadoByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Empleado>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertEmpleado(Empleado Empleado)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(Empleado.IDEmpleado), Empleado.IDEmpleado);
            parameters.Add(nameof(Empleado.Nombre), Empleado.Nombre);
            parameters.Add(nameof(Empleado.Apellido), Empleado.Apellido);
            parameters.Add(nameof(Empleado.Identificacion), Empleado.Identificacion);
            parameters.Add(nameof(Empleado.Puesto), Empleado.Puesto);
            parameters.Add(nameof(Empleado.SalarioHora), Empleado.SalarioHora);
            parameters.Add(nameof(Empleado.FechaIngreso), Empleado.FechaIngreso);
            parameters.Add(nameof(Empleado.Correo), Empleado.Correo);
            parameters.Add(nameof(Empleado.Activo), Empleado.Activo); 

            parameters.Add("Usuario", Empleado.Usuario);
            parameters.Add("Sentence", "InsertEmpleado");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Empleado_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }

        public List<Response> UpdateEmpleado(Empleado Empleado)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(Empleado.IDEmpleado), Empleado.IDEmpleado);
            parameters.Add(nameof(Empleado.Nombre), Empleado.Nombre);
            parameters.Add(nameof(Empleado.Apellido), Empleado.Apellido);
            parameters.Add(nameof(Empleado.Identificacion), Empleado.Identificacion);
            parameters.Add(nameof(Empleado.Puesto), Empleado.Puesto);
            parameters.Add(nameof(Empleado.SalarioHora), Empleado.SalarioHora);
            parameters.Add(nameof(Empleado.FechaIngreso), Empleado.FechaIngreso);
            parameters.Add(nameof(Empleado.Correo), Empleado.Correo);
            parameters.Add(nameof(Empleado.Activo), Empleado.Activo);

            parameters.Add("Usuario", Empleado.Usuario);
            parameters.Add("Sentence", "UpdateEmpleado");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Empleado_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
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
        #endregion


        #region Planilla
        public List<Planilla> GetPlanilla(string Usuario)
        {
            return GetPlanilla("sp_Planilla_001", Usuario);
        }

        protected List<Planilla> GetPlanilla(string procedure, string Usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", Usuario);
            parameters.Add("Sentence", "LoadAllPlanilla");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Planilla>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Planilla> GetPlanillabyInfo(int idPlanilla, string Usuario)
        {
            return GetPlanillaInfo("sp_Planilla_001", idPlanilla, Usuario);
        }

        protected List<Planilla> GetPlanillaInfo(string procedure, int idPlanilla, string Usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idPlanilla), idPlanilla);

            parameters.Add("Usuario", Usuario);
            parameters.Add("Sentence", "LoadPlanillaByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Planilla>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertPlanilla(Planilla Planilla)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(Planilla.IDPlanilla), Planilla.IDPlanilla);
            parameters.Add(nameof(Planilla.Nombre), Planilla.Nombre);
            parameters.Add(nameof(Planilla.FechaInicio), Planilla.FechaInicio);
            parameters.Add(nameof(Planilla.FechaFin), Planilla.FechaFin);
            parameters.Add(nameof(Planilla.Estado), Planilla.Estado);

            parameters.Add("Usuario", Planilla.Usuario);
            parameters.Add("Sentence", "InsertPlanilla");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Planilla_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }

        public List<Response> UpdatePlanilla(Planilla Planilla)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(Planilla.IDPlanilla), Planilla.IDPlanilla);
            parameters.Add(nameof(Planilla.Nombre), Planilla.Nombre);
            parameters.Add(nameof(Planilla.FechaInicio), Planilla.FechaInicio);
            parameters.Add(nameof(Planilla.FechaFin), Planilla.FechaFin);
            parameters.Add(nameof(Planilla.Estado), Planilla.Estado);

            parameters.Add("Usuario", Planilla.Usuario);
            parameters.Add("Sentence", "UpdatePlanilla");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Planilla_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }
        #endregion
    }
}
                        