using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.GPR;
using Models.GNR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PresupuestoApiController : Controller
    {
        private readonly ILogger<PresupuestoApiController> _logger;
        private readonly ICRMConnectionDB _repository;

        public PresupuestoApiController(ILogger<PresupuestoApiController> logger, ICRMConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region Presupuestos
        [Route("GetPresupuestos")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Presupuesto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Presupuesto> GetPresupuestos(string usuario)
        {
            try
            {
                var presupuestoData = _repository.GetPresupuestos(usuario);
                return presupuestoData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetPresupuestos));
                throw;
            }
        }

        [Route("GetPresupuestoByID")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Presupuesto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Presupuesto> GetPresupuestoByID(int idPresupuesto, string usuario)
        {
            try
            {
                var presupuestoData = _repository.GetPresupuestoByID(idPresupuesto, usuario);
                return presupuestoData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetPresupuestoByID));
                throw;
            }
        }

        [Route("InsertPresupuesto")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Presupuesto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertPresupuesto(Presupuesto presupuesto)
        {
            try
            {
                var res = _repository.InsertPresupuesto(presupuesto);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertPresupuesto));
                throw;
            }
        }

        [Route("UpdatePresupuesto")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Presupuesto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdatePresupuesto(Presupuesto presupuesto)
        {
            try
            {
                var res = _repository.UpdatePresupuesto(presupuesto);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdatePresupuesto));
                throw;
            }
        }
        #endregion
    }
}
