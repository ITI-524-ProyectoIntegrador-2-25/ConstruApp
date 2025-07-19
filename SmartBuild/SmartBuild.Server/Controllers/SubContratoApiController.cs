using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.GPR;
using Models.GNR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SubcontratoApiController : Controller
    {
        private readonly ILogger<SubcontratoApiController> _logger;
        private readonly IGPRConnectionDB _repository;

        public SubcontratoApiController(ILogger<SubcontratoApiController> logger, IGPRConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region Subcontrato

        [Route("GetSubcontratos")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SubContrato))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<SubContrato> GetSubcontratos(string usuario)
        {
            try
            {
                var pagos = _repository.GetSubcontratos(usuario);
                return pagos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetSubcontratos));
                throw;
            }
        }

        [Route("GetSubcontratoByID")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SubContrato))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<SubContrato> GetSubcontratoByID(int id, string usuario)
        {
            try
            {
                var pago = _repository.GetSubcontratoByID(id, usuario);
                return pago;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetSubcontratoByID));
                throw;
            }
        }

        [Route("InsertSubcontrato")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertSubcontrato(SubContrato subContrato)
        {
            try
            {
                var result = _repository.InsertSubcontrato(subContrato);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertSubcontrato));
                throw;
            }
        }

        [Route("UpdateSubcontrato")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdateSubcontrato(SubContrato subContrato)
        {
            try
            {
                var result = _repository.UpdateSubcontrato(subContrato);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdateSubcontrato));
                throw;
            }
        }

        #endregion
    }
}
