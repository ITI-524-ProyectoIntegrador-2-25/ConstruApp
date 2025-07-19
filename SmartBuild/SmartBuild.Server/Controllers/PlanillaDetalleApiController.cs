using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.GNR;
using Models.GPR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlanillaDetalleApiController : Controller
    {
        private readonly ILogger<PlanillaDetalleApiController> _logger;
        private readonly IGPRConnectionDB _repository;

        public PlanillaDetalleApiController(ILogger<PlanillaDetalleApiController> logger, IGPRConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region PlanillaDetalle
        [Route("GetPlanillaDetalle")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PlanillaDetalle))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<PlanillaDetalle> GetPlanillasDetalle(string usuario)
        {
            try
            {
                var planillaData = _repository.GetPlanillasDetalle(usuario);
                return planillaData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetPlanillasDetalle));
                throw;
            }
        }

        [Route("GetPlanillaDetallebyInfo")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PlanillaDetalle))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<PlanillaDetalle> GetPlanillaDetallebyInfo(int idPlanillaDetalle, string Usuario)
        {
            try
            {
                var planillaData = _repository.GetPlanillaDetallebyInfo(idPlanillaDetalle, Usuario);
                return planillaData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetPlanillaDetallebyInfo));
                throw;
            }
        }

        [Route("InsertPlanillaDetalle")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Planilla))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertPlanillaDetalle(PlanillaDetalle planillaDetalle)
        {
            try
            {
                var res = _repository.InsertPlanillaDetalle(planillaDetalle);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertPlanillaDetalle));
                throw;
            }
        }

        [Route("UpdatePlanillaDetalle")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PlanillaDetalle))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdatePlanillaDetalle(PlanillaDetalle planillaDetalle)
        {
            try
            {
                var res = _repository.UpdatePlanillaDetalle(planillaDetalle);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdatePlanillaDetalle));
                throw;
            }
        }
        #endregion
    }
}
