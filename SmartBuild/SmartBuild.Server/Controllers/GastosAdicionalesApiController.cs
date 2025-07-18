using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.GPR;
using Models.GNR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GastosAdicionalesApiController : Controller
    {
        private readonly ILogger<GastosAdicionalesApiController> _logger;
        private readonly ICRMConnectionDB _repository;

        public GastosAdicionalesApiController(ILogger<GastosAdicionalesApiController> logger, ICRMConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region GastosAdicionales

        [Route("GetGastosAdicionales")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GastoAdicional))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<GastoAdicional> GetGastosAdicionales(string usuario)
        {
            try
            {
                var data = _repository.GetGastosAdicionales(usuario);
                return data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetGastosAdicionales));
                throw;
            }
        }

        [Route("GetGastoAdicionalByID")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GastoAdicional))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<GastoAdicional> GetGastoAdicionalInfo(int idGastoAdicional, string usuario)
        {
            try
            {
                var data = _repository.GetGastoAdicionalByID(idGastoAdicional, usuario);
                return data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetGastoAdicionalInfo));
                throw;
            }
        }

        [Route("InsertGastoAdicional")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GastoAdicional))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertGastoAdicional(GastoAdicional gastoAdicional)
        {
            try
            {
                var res = _repository.InsertGastoAdicional(gastoAdicional);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertGastoAdicional));
                throw;
            }
        }

        [Route("UpdateGastoAdicional")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GastoAdicional))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdateGastoAdicional(GastoAdicional gastoAdicional)
        {
            try
            {
                var res = _repository.UpdateGastoAdicional(gastoAdicional);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdateGastoAdicional));
                throw;
            }
        }

        #endregion
    }
}
