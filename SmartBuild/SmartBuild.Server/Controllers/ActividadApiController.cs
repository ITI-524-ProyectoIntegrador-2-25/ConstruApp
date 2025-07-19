using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.CRM;
using Models.GNR;
using Models.GPR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ActividadApiController : Controller
    {
        private readonly ILogger<ActividadApiController> _logger;
        private readonly IGPRConnectionDB _repository;

        public ActividadApiController(ILogger<ActividadApiController> logger, IGPRConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region Actividad
        [Route("GetActividades")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Actividad))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Actividad> GetActividades(string usuario)
        {
            try
            {
                var ActividadData = _repository.GetActividades(usuario);
                return ActividadData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetActividades));
                throw;
            }
        }

        [Route("GetActividadbyInfo")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Actividad))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Actividad> GetActividadbyInfo(int idActividad, string usuario)
        {
            try
            {
                var contactData = _repository.GetActividadbyInfo(idActividad, usuario);
                return contactData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetActividadbyInfo));
                throw;
            }
        }

        [Route("InsertActividad")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Actividad))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertActividad(Actividad actividad)
        {
            try
            {
                var res = _repository.InsertActividad(actividad);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertActividad));
                throw;
            }
        }

        [Route("UpdateActividad")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Contacto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdateActividad(Actividad actividad)
        {
            try
            {
                var res = _repository.UpdateActividad(actividad);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdateActividad));
                throw;
            }
        }
        #endregion
    }
}
