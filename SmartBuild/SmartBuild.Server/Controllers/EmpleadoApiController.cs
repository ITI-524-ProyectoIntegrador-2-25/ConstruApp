using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.CRM;
using Models.GNR;
using Models.GPR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EmpleadoApiController : Controller
    {
        private readonly ILogger<ContactApiController> _logger;
        private readonly ICRMConnectionDB _repository;

        public EmpleadoApiController(ILogger<ContactApiController> logger, ICRMConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region Empleado
        [Route("GetEmpleado")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Empleado))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Empleado> GetEmpleado(string usuario)
        {
            try
            {
                var EmpleadoData = _repository.GetEmpleados(usuario);
                return EmpleadoData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetEmpleado));
                throw;
            }
        }

        [Route("GetEmpleadoInfo")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Empleado))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Empleado> GetEmpleadobyInfo(int idEmpleado, string usuario)
        {
            try
            {
                var contactData = _repository.GetEmpleadobyInfo(idEmpleado, usuario);
                return contactData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetEmpleadobyInfo));
                throw;
            }
        }

        [Route("InsertEmpleado")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Empleado))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertEmpleado(Empleado empleado)
        {
            try
            {
                var res = _repository.InsertEmpleado(empleado);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertEmpleado));
                throw;
            }
        }

        [Route("UpdateEmpleado")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Contacto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdateEmpleado(Empleado empleado)
        {
            try
            {
                var res = _repository.UpdateEmpleado(empleado);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdateEmpleado));
                throw;
            }
        }
        #endregion
    }
}
