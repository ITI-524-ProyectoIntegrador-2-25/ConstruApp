using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.GPR;
using Models.GNR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PagoSubcontratoApiController : Controller
    {
        private readonly ILogger<PagoSubcontratoApiController> _logger;
        private readonly IGPRConnectionDB _repository;

        public PagoSubcontratoApiController(ILogger<PagoSubcontratoApiController> logger, IGPRConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region PagoSubcontrato

        [Route("GetPagosSubcontrato")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagoSubContrato))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<PagoSubContrato> GetPagosSubcontrato(string usuario)
        {
            try
            {
                var pagos = _repository.GetPagosSubcontrato(usuario);
                return pagos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetPagosSubcontrato));
                throw;
            }
        }

        [Route("GetPagoSubcontratoByID")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PagoSubContrato))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<PagoSubContrato> GetPagoSubcontratoByID(int idPago, string usuario)
        {
            try
            {
                var pago = _repository.GetPagoSubcontratoByID(idPago, usuario);
                return pago;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetPagoSubcontratoByID));
                throw;
            }
        }

        [Route("InsertPagoSubcontrato")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertPagoSubcontrato(PagoSubContrato pago)
        {
            try
            {
                var result = _repository.InsertPagoSubcontrato(pago);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertPagoSubcontrato));
                throw;
            }
        }

        [Route("UpdatePagoSubcontrato")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Response))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdatePagoSubcontrato(PagoSubContrato pago)
        {
            try
            {
                var result = _repository.UpdatePagoSubcontrato(pago);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdatePagoSubcontrato));
                throw;
            }
        }

        #endregion
    }
}
