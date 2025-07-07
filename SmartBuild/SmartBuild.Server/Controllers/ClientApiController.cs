using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.CRM;
using Models.GNR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ClientApiController : Controller
    {
        private readonly ILogger<ClientApiController> _logger;
        private readonly ICRMConnectionDB _repository;

        public ClientApiController(ILogger<ClientApiController> logger, ICRMConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region Clientes
        [Route("GetClients")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Cliente))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Cliente> GetClients(string usuario)
        {
            try
            {
                var suppliersData = _repository.GetClients(usuario);
                return suppliersData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetClients));
                throw;
            }
        }

        [Route("GetClientInfo")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Cliente))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Cliente> GetClientInfo(int idCliente, string usuario)
        {
            try
            {
                var suppliersData = _repository.GetClientInfo(idCliente, usuario);
                return suppliersData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetClientInfo));
                throw;
            }
        }

        [Route("InsertClient")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Cliente))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public Response InsertClient(Cliente cliente)
        {
            try
            {
                var res = _repository.InsertClient(cliente);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertClient));
                throw;
            }
        }

        [Route("UpdateClient")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Cliente))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public Response UpdateClient(Cliente cliente)
        {
            try
            {
                var res = _repository.UpdateClient(cliente);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdateClient));
                throw;
            }
        }
        #endregion
    }
}
