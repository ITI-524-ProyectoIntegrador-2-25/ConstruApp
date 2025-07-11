using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.CRM;
using Models.GNR;
using Models.GPR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsuarioApiController : Controller
    {
        private readonly ILogger<EmpleadoApiController> _logger;
        private readonly ICRMConnectionDB _repository;

        public UsuarioApiController(ILogger<EmpleadoApiController> logger, ICRMConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region Usuario
        [Route("GetUsuario")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Usuario))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Usuario> GetUsuario(string usuario)
        {
            try
            {
                var userData = _repository.GetUsuario(usuario);
                return userData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetUsuario));
                throw;
            }
        }

        [Route("GetUsuarioInfo")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Usuario))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Usuario> GetUsuarioInfo(int idUsuario, string usuario)
        {
            try
            {
                var userData = _repository.GetUsuariobyInfo(idUsuario, usuario);
                return userData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetUsuarioInfo));
                throw;
            }
        }

        [Route("InsertUsuario")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Usuario))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertUsuario(Usuario usuario)
        {
            try
            {
                var res = _repository.InsertUsuario(usuario);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertUsuario));
                throw;
            }
        }

        [Route("UpdateUsuario")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Usuario))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdateUsuario(Usuario usuario)
        {
            try
            {
                var res = _repository.UpdateUsuario(usuario);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdateUsuario));
                throw;
            }
        }
        #endregion
    }
}
