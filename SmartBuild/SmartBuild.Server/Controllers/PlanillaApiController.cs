using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.GNR;
using Models.GPR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlanillaApiController : Controller
    {
        private readonly ILogger<PlanillaApiController> _logger;
        private readonly IGPRConnectionDB _repository;

        public PlanillaApiController(ILogger<PlanillaApiController> logger, IGPRConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region Planilla
        [Route("GetPlanilla")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Planilla))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Planilla> GetPlanilla(string usuario)
        {
            try
            {
                var PlanillaData = _repository.GetPlanilla(usuario);
                return PlanillaData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetPlanilla));
                throw;
            }
        }

        [Route("GetPlanillabyInfo")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Planilla))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Planilla> GetPlanillabyInfo(int idPlanilla, string Usuario)
        {
            try
            {
                var PlanillaData = _repository.GetPlanillabyInfo(idPlanilla, Usuario);
                return PlanillaData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetPlanillabyInfo));
                throw;
            }
        }

        [Route("InsertPlanilla")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Planilla))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertPlanilla(Planilla planilla)
        {
            try
            {
                var res = _repository.InsertPlanilla(planilla);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertPlanilla));
                throw;
            }
        }

        [Route("UpdatePlanilla")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Planilla))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdatePlanilla(Planilla planilla)
        {
            try
            {
                var res = _repository.UpdatePlanilla(planilla);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdatePlanilla));
                throw;
            }
        }
        #endregion
    }
}
