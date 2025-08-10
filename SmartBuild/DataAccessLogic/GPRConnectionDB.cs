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
    public class GPRConnectionDB : IGPRConnectionDB
    {
        private readonly IConfiguration _config;
        private string Connectionstring = "DefaultConnection";

        public GPRConnectionDB(IConfiguration config)
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

        #region Actividades
        public List<Actividad> GetActividades(string usuario)
        {
            return GetActividades("sp_Actividad_001", usuario);
        }

        protected List<Actividad> GetActividades(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();


            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllActividad");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Actividad>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Actividad> GetActividadbyInfo(int idActividad, string usuario)
        {
            return GetActividadbyInfo("sp_Actividad_001", idActividad, usuario);
        }

        protected List<Actividad> GetActividadbyInfo(string procedure, int idActividad, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idActividad), idActividad);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadActividadByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Actividad>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertActividad(Actividad actividad)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(actividad.IDActividad), actividad.IDActividad);
            parameters.Add(nameof(actividad.ActividadID), actividad.ActividadID);
            parameters.Add(nameof(actividad.PresupuestoID), actividad.PresupuestoID);
            parameters.Add(nameof(actividad.Descripcion), actividad.Descripcion);
            parameters.Add(nameof(actividad.FechaInicioProyectada), actividad.FechaFinProyectada);
            parameters.Add(nameof(actividad.FechaFinProyectada), actividad.FechaFinProyectada);
            parameters.Add(nameof(actividad.FechaInicioReal), actividad.FechaInicioReal);
            parameters.Add(nameof(actividad.FechaFinReal), actividad.FechaFinReal);
            parameters.Add(nameof(actividad.Estado), actividad.Estado);

            parameters.Add("Usuario", actividad.Usuario);
            parameters.Add("Sentence", "InsertActividad");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Actividad_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }

        public List<Response> UpdateActividad(Actividad actividad)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(actividad.IDActividad), actividad.IDActividad);
            parameters.Add(nameof(actividad.ActividadID), actividad.ActividadID);
            parameters.Add(nameof(actividad.PresupuestoID), actividad.PresupuestoID);
            parameters.Add(nameof(actividad.Descripcion), actividad.Descripcion);
            parameters.Add(nameof(actividad.FechaInicioProyectada), actividad.FechaFinProyectada);
            parameters.Add(nameof(actividad.FechaFinProyectada), actividad.FechaFinProyectada);
            parameters.Add(nameof(actividad.FechaInicioReal), actividad.FechaInicioReal);
            parameters.Add(nameof(actividad.FechaFinReal), actividad.FechaFinReal);
            parameters.Add(nameof(actividad.Estado), actividad.Estado);

            parameters.Add("Usuario", actividad.Usuario);
            parameters.Add("Sentence", "UpdateActividad");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Actividad_001", parameters, commandType: CommandType.StoredProcedure);
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

        #region PlanillaDetalle
        public List<PlanillaDetalle> GetPlanillasDetalle(string Usuario)
        {
            return GetPlanillasDetalle("sp_PlanillaDetalle_001", Usuario);
        }

        protected List<PlanillaDetalle> GetPlanillasDetalle(string procedure, string Usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", Usuario);
            parameters.Add("Sentence", "LoadAllPlanillaDetalle");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<PlanillaDetalle>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<PlanillaDetalle> GetPlanillaDetallebyInfo(int idDetallePlanilla, string Usuario)
        {
            return GetPlanillaDetalleInfo("sp_PlanillaDetalle_001", idDetallePlanilla, Usuario);
        }

        protected List<PlanillaDetalle> GetPlanillaDetalleInfo(string procedure, int idDetallePlanilla, string Usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idDetallePlanilla), idDetallePlanilla);

            parameters.Add("Usuario", Usuario);
            parameters.Add("Sentence", "LoadPlanillaDetalleByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<PlanillaDetalle>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

    public List<Response> InsertPlanillaDetalle(PlanillaDetalle PlanillaDetalle)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(PlanillaDetalle.IDDetallePlanilla), PlanillaDetalle.IDDetallePlanilla);
            parameters.Add(nameof(PlanillaDetalle.PlanillaID), PlanillaDetalle.PlanillaID);
            parameters.Add(nameof(PlanillaDetalle.EmpleadoID), PlanillaDetalle.EmpleadoID);
            parameters.Add(nameof(PlanillaDetalle.PresupuestoID), PlanillaDetalle.PresupuestoID);
            parameters.Add(nameof(PlanillaDetalle.Fecha), PlanillaDetalle.Fecha);
            parameters.Add(nameof(PlanillaDetalle.SalarioHora), PlanillaDetalle.SalarioHora);
            parameters.Add(nameof(PlanillaDetalle.HorasOrdinarias), PlanillaDetalle.HorasOrdinarias);
            parameters.Add(nameof(PlanillaDetalle.HorasExtras), PlanillaDetalle.HorasExtras);
            parameters.Add(nameof(PlanillaDetalle.HorasDobles), PlanillaDetalle.HorasDobles);
            parameters.Add(nameof(PlanillaDetalle.Detalle), PlanillaDetalle.Detalle);

        parameters.Add("Usuario", PlanillaDetalle.Usuario);
        parameters.Add("Sentence", "InsertPlanillaDetalle");

        parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

        var response = GetDbConnection().Query<Response>(
            "sp_PlanillaDetalle_001",
            parameters,
            commandType: CommandType.StoredProcedure
        );

        msg = parameters.Get<string>(nameof(msg));

    return response.ToList();
}


        public List<Response> UpdatePlanillaDetalle(PlanillaDetalle PlanillaDetalle)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(PlanillaDetalle.IDDetallePlanilla), PlanillaDetalle.IDDetallePlanilla);
            parameters.Add(nameof(PlanillaDetalle.PlanillaID), PlanillaDetalle.PlanillaID);
            parameters.Add(nameof(PlanillaDetalle.EmpleadoID), PlanillaDetalle.EmpleadoID);
            parameters.Add(nameof(PlanillaDetalle.PresupuestoID), PlanillaDetalle.PresupuestoID);
            parameters.Add(nameof(PlanillaDetalle.Fecha), PlanillaDetalle.Fecha);
            parameters.Add(nameof(PlanillaDetalle.SalarioHora), PlanillaDetalle.SalarioHora);
            parameters.Add(nameof(PlanillaDetalle.HorasOrdinarias), PlanillaDetalle.HorasOrdinarias);
            parameters.Add(nameof(PlanillaDetalle.HorasExtras), PlanillaDetalle.HorasExtras);
            parameters.Add(nameof(PlanillaDetalle.HorasDobles), PlanillaDetalle.HorasDobles);
            parameters.Add(nameof(PlanillaDetalle.Detalle), PlanillaDetalle.Detalle);

            parameters.Add("Usuario", PlanillaDetalle.Usuario);
            parameters.Add("Sentence", "UpdatePlanillaDetalle");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_PlanillaDetalle_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }
        #endregion

        #region Presupuesto
        public List<Presupuesto> GetPresupuestos(string usuario)
        {
            return GetPresupuesto("sp_Presupuesto_001", usuario);
        }

        protected List<Presupuesto> GetPresupuesto(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllPresupuestos");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Presupuesto>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Presupuesto> GetPresupuestoByID(int idPresupuesto, string usuario)
        {
            return GetPresupuestobyInfo("sp_Presupuesto_001", idPresupuesto, usuario);
        }

        protected List<Presupuesto> GetPresupuestobyInfo(string procedure, int idPresupuesto, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idPresupuesto), idPresupuesto);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadPresupuestoByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Presupuesto>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertPresupuesto(Presupuesto presupuesto)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(presupuesto.IDPresupuesto), presupuesto.IDPresupuesto);
            parameters.Add(nameof(presupuesto.ClienteID), presupuesto.ClienteID);
            parameters.Add(nameof(presupuesto.FechaInicio), presupuesto.FechaInicio);
            parameters.Add(nameof(presupuesto.FechaFin), presupuesto.FechaFin);
            parameters.Add(nameof(presupuesto.MontoProyecto), presupuesto.MontoProyecto);
            parameters.Add(nameof(presupuesto.Penalizacion), presupuesto.Penalizacion);
            parameters.Add(nameof(presupuesto.MontoPenalizacion), presupuesto.MontoPenalizacion);
            parameters.Add(nameof(presupuesto.PeriodoPenalizacion), presupuesto.PeriodoPenalizacion);
            parameters.Add(nameof(presupuesto.Descripcion), presupuesto.Descripcion);
            parameters.Add(nameof(presupuesto.MateriaPrimaCotizada), presupuesto.MateriaPrimaCotizada);
            parameters.Add(nameof(presupuesto.ManoObraCotizada), presupuesto.ManoObraCotizada);
            parameters.Add(nameof(presupuesto.MateriaPrimaCostoReal), presupuesto.MateriaPrimaCostoReal);
            parameters.Add(nameof(presupuesto.ManoObraCostoReal), presupuesto.ManoObraCostoReal);
            parameters.Add(nameof(presupuesto.SubContratoCostoReal), presupuesto.SubContratoCostoReal);
            parameters.Add(nameof(presupuesto.OtrosGastos), presupuesto.OtrosGastos);
            parameters.Add(nameof(presupuesto.FechaInicioReal), presupuesto.FechaInicioReal);
            parameters.Add(nameof(presupuesto.FechaFinReal), presupuesto.FechaFinReal);
            parameters.Add(nameof(presupuesto.Estado), presupuesto.Estado);

            parameters.Add("Usuario", presupuesto.Usuario);
            parameters.Add("Sentence", "InsertPresupuesto");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Presupuesto_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> UpdatePresupuesto(Presupuesto presupuesto)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(presupuesto.IDPresupuesto), presupuesto.IDPresupuesto);
            parameters.Add(nameof(presupuesto.ClienteID), presupuesto.ClienteID);
            parameters.Add(nameof(presupuesto.FechaInicio), presupuesto.FechaInicio);
            parameters.Add(nameof(presupuesto.FechaFin), presupuesto.FechaFin);
            parameters.Add(nameof(presupuesto.MontoProyecto), presupuesto.MontoProyecto);
            parameters.Add(nameof(presupuesto.Penalizacion), presupuesto.Penalizacion);
            parameters.Add(nameof(presupuesto.MontoPenalizacion), presupuesto.MontoPenalizacion);
            parameters.Add(nameof(presupuesto.PeriodoPenalizacion), presupuesto.PeriodoPenalizacion);
            parameters.Add(nameof(presupuesto.Descripcion), presupuesto.Descripcion);
            parameters.Add(nameof(presupuesto.MateriaPrimaCotizada), presupuesto.MateriaPrimaCotizada);
            parameters.Add(nameof(presupuesto.ManoObraCotizada), presupuesto.ManoObraCotizada);
            parameters.Add(nameof(presupuesto.MateriaPrimaCostoReal), presupuesto.MateriaPrimaCostoReal);
            parameters.Add(nameof(presupuesto.ManoObraCostoReal), presupuesto.ManoObraCostoReal);
            parameters.Add(nameof(presupuesto.SubContratoCostoReal), presupuesto.SubContratoCostoReal);
            parameters.Add(nameof(presupuesto.OtrosGastos), presupuesto.OtrosGastos);
            parameters.Add(nameof(presupuesto.FechaInicioReal), presupuesto.FechaInicioReal);
            parameters.Add(nameof(presupuesto.FechaFinReal), presupuesto.FechaFinReal);
            parameters.Add(nameof(presupuesto.Estado), presupuesto.Estado);

            parameters.Add("Usuario", presupuesto.Usuario);
            parameters.Add("Sentence", "UpdatePresupuesto");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Presupuesto_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));

            return response.ToList();
        }
        #endregion

        #region GastosAdicionales
        public List<GastoAdicional> GetGastosAdicionales(string usuario)
        {
            return GetGastoAdicional("sp_GastosAdicionales_001", usuario);
        }

        protected List<GastoAdicional> GetGastoAdicional(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllGastos");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<GastoAdicional>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<GastoAdicional> GetGastoAdicionalByID(int idGasto, string usuario)
        {
            return GetGastoAdicionalByInfo("sp_GastosAdicionales_001", idGasto, usuario);
        }

        protected List<GastoAdicional> GetGastoAdicionalByInfo(string procedure, int idGasto, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idGasto), idGasto);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadGastoByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<GastoAdicional>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertGastoAdicional(GastoAdicional gasto)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(gasto.IDGasto), gasto.IDGasto);
            parameters.Add(nameof(gasto.PresupuestoID), gasto.PresupuestoID);
            parameters.Add(nameof(gasto.Fecha), gasto.Fecha);
            parameters.Add(nameof(gasto.Descripcion), gasto.Descripcion);
            parameters.Add(nameof(gasto.Monto), gasto.Monto);
            parameters.Add(nameof(gasto.EstadoPago), gasto.EstadoPago);

            parameters.Add("Usuario", gasto.Usuario);
            parameters.Add("Sentence", "InsertGasto");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_GastosAdicionales_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> UpdateGastoAdicional(GastoAdicional gasto)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(gasto.IDGasto), gasto.IDGasto);
            parameters.Add(nameof(gasto.PresupuestoID), gasto.PresupuestoID);
            parameters.Add(nameof(gasto.Fecha), gasto.Fecha);
            parameters.Add(nameof(gasto.Descripcion), gasto.Descripcion);
            parameters.Add(nameof(gasto.Monto), gasto.Monto);
            parameters.Add(nameof(gasto.EstadoPago), gasto.EstadoPago);

            parameters.Add("Usuario", gasto.Usuario);
            parameters.Add("Sentence", "UpdateGasto");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_GastosAdicionales_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }
        #endregion

        #region MateriaPrima

        public List<MateriaPrima> GetMateriasPrimas(string usuario)
        {
            return GetMateriaPrima("sp_MateriaPrima_001", usuario);
        }

        protected List<MateriaPrima> GetMateriaPrima(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllMateriaPrima");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<MateriaPrima>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<MateriaPrima> GetMateriaPrimaByID(int idMateriaPrima, string usuario)
        {
            return GetMateriaPrimaByInfo("sp_MateriaPrima_001", idMateriaPrima, usuario);
        }

        protected List<MateriaPrima> GetMateriaPrimaByInfo(string procedure, int idMateriaPrima, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idMateriaPrima), idMateriaPrima);
            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadMateriaPrimaByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<MateriaPrima>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertMateriaPrima(MateriaPrima materiaPrima)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(materiaPrima.PresupuestoID), materiaPrima.PresupuestoID);
            parameters.Add(nameof(materiaPrima.Proveedor), materiaPrima.Proveedor);
            parameters.Add(nameof(materiaPrima.Descripcion), materiaPrima.Descripcion);
            parameters.Add(nameof(materiaPrima.CostoUnitario), materiaPrima.CostoUnitario);
            parameters.Add(nameof(materiaPrima.Cantidad), materiaPrima.Cantidad);
            parameters.Add(nameof(materiaPrima.CantidadMinima), materiaPrima.CantidadMinima);
            parameters.Add(nameof(materiaPrima.UnidadMedida), materiaPrima.UnidadMedida);
            parameters.Add(nameof(materiaPrima.Planificado), materiaPrima.Planificado);

            parameters.Add("Usuario", materiaPrima.Usuario); 
            parameters.Add("Sentence", "InsertMateriaPrima");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_MateriaPrima_001", parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> UpdateMateriaPrima(MateriaPrima materiaPrima)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(materiaPrima.IDMateriaPrima), materiaPrima.IDMateriaPrima);
            parameters.Add(nameof(materiaPrima.PresupuestoID), materiaPrima.PresupuestoID);
            parameters.Add(nameof(materiaPrima.Proveedor), materiaPrima.Proveedor);
            parameters.Add(nameof(materiaPrima.Descripcion), materiaPrima.Descripcion);
            parameters.Add(nameof(materiaPrima.CostoUnitario), materiaPrima.CostoUnitario);
            parameters.Add(nameof(materiaPrima.Cantidad), materiaPrima.Cantidad);
            parameters.Add(nameof(materiaPrima.CantidadMinima), materiaPrima.CantidadMinima);
            parameters.Add(nameof(materiaPrima.UnidadMedida), materiaPrima.UnidadMedida);
            parameters.Add(nameof(materiaPrima.Planificado), materiaPrima.Planificado);

            parameters.Add("Usuario", materiaPrima.Usuario); 
            parameters.Add("Sentence", "UpdateMateriaPrima");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_MateriaPrima_001", parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        #endregion

        #region Subcontrato
        public List<SubContrato> GetSubcontratos(string usuario)
        {
            return GetSubcontratos("sp_Subcontrato_001", usuario);
        }

        protected List<SubContrato> GetSubcontratos(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllSubcontrato");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<SubContrato>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<SubContrato> GetSubcontratoByID(int idSubcontrato, string usuario)
        {
            return GetSubcontratoByID("sp_Subcontrato_001", idSubcontrato, usuario);
        }

        protected List<SubContrato> GetSubcontratoByID(string procedure, int idSubcontrato, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idSubcontrato), idSubcontrato);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadSubcontratoByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<SubContrato>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertSubcontrato(SubContrato subContrato)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(subContrato.IDSubcontrato), subContrato.IDSubcontrato);
            parameters.Add(nameof(subContrato.PresupuestoID), subContrato.PresupuestoID);
            parameters.Add(nameof(subContrato.NombreProveedor), subContrato.NombreProveedor);
            parameters.Add(nameof(subContrato.Descripcion), subContrato.Descripcion);
            parameters.Add(nameof(subContrato.FechaInicioProyectada), subContrato.FechaFinProyectada);
            parameters.Add(nameof(subContrato.FechaFinProyectada), subContrato.FechaFinProyectada);
            parameters.Add(nameof(subContrato.FechaInicioReal), subContrato.FechaInicioReal);
            parameters.Add(nameof(subContrato.FechaFinReal), subContrato.FechaFinReal);
            parameters.Add(nameof(subContrato.PorcentajeAvance), subContrato.PorcentajeAvance);
            parameters.Add(nameof(subContrato.MontoCotizado), subContrato.MontoCotizado);

            parameters.Add("Usuario", subContrato.Usuario);
            parameters.Add("Sentence", "InsertSubcontrato");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Subcontrato_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> UpdateSubcontrato(SubContrato subContrato)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(subContrato.IDSubcontrato), subContrato.IDSubcontrato);
            parameters.Add(nameof(subContrato.PresupuestoID), subContrato.PresupuestoID);
            parameters.Add(nameof(subContrato.NombreProveedor), subContrato.NombreProveedor);
            parameters.Add(nameof(subContrato.Descripcion), subContrato.Descripcion);
            parameters.Add(nameof(subContrato.FechaInicioProyectada), subContrato.FechaFinProyectada);
            parameters.Add(nameof(subContrato.FechaFinProyectada), subContrato.FechaFinProyectada);
            parameters.Add(nameof(subContrato.FechaInicioReal), subContrato.FechaInicioReal);
            parameters.Add(nameof(subContrato.FechaFinReal), subContrato.FechaFinReal);
            parameters.Add(nameof(subContrato.PorcentajeAvance), subContrato.PorcentajeAvance);
            parameters.Add(nameof(subContrato.MontoCotizado), subContrato.MontoCotizado);

            parameters.Add("Usuario", subContrato.Usuario);
            parameters.Add("Sentence", "UpdateSubcontrato");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_Subcontrato_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }
        #endregion

        #region PagoSubcontrato
        public List<PagoSubContrato> GetPagosSubcontrato(string usuario)
        {
            return GetPagoSubcontrato("sp_PagoSubcontrato_001", usuario);
        }

        protected List<PagoSubContrato> GetPagoSubcontrato(string procedure, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadAllPagoSubcontrato");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<PagoSubContrato>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<PagoSubContrato> GetPagoSubcontratoByID(int idPago, string usuario)
        {
            return GetPagoSubcontratoByID("sp_PagoSubcontrato_001", idPago, usuario);
        }

        protected List<PagoSubContrato> GetPagoSubcontratoByID(string procedure, int idPago, string usuario)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(idPago), idPago);

            parameters.Add("Usuario", usuario);
            parameters.Add("Sentence", "LoadPagoSubcontratoByID");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<PagoSubContrato>(procedure, parameters, commandType: CommandType.StoredProcedure);

            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> InsertPagoSubcontrato(PagoSubContrato pago)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(pago.IDPago), pago.IDPago);
            parameters.Add(nameof(pago.SubcontratoID), pago.SubcontratoID);
            parameters.Add(nameof(pago.MontoPagado), pago.MontoPagado);
            parameters.Add(nameof(pago.FechaPago), pago.FechaPago);

            parameters.Add("Usuario", pago.Usuario);
            parameters.Add("Sentence", "InsertPagoSubcontrato");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_PagoSubcontrato_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }

        public List<Response> UpdatePagoSubcontrato(PagoSubContrato pago)
        {
            var msg = "";
            var parameters = new DynamicParameters();

            parameters.Add(nameof(pago.IDPago), pago.IDPago);
            parameters.Add(nameof(pago.SubcontratoID), pago.SubcontratoID);
            parameters.Add(nameof(pago.MontoPagado), pago.MontoPagado);
            parameters.Add(nameof(pago.FechaPago), pago.FechaPago);

            parameters.Add("Usuario", pago.Usuario);
            parameters.Add("Sentence", "UpdatePagoSubcontrato");

            parameters.Add(nameof(msg), dbType: DbType.String, direction: ParameterDirection.InputOutput, size: 300);

            var response = GetDbConnection().Query<Response>("sp_PagoSubcontrato_001", parameters, commandType: CommandType.StoredProcedure);
            msg = parameters.Get<string>(nameof(msg));
            return response.ToList();
        }
        #endregion
    }
}
                        