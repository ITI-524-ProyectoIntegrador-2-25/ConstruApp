using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.GPR;
using Models.GNR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MateriaPrimaApiController : Controller
    {
        private readonly ILogger<MateriaPrimaApiController> _logger;
        private readonly IGPRConnectionDB _repository;

        public MateriaPrimaApiController(ILogger<MateriaPrimaApiController> logger, IGPRConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region MateriaPrima

        [Route("GetMateriasPrimas")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MateriaPrima))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<MateriaPrima> GetMateriasPrimas(string usuario)
        {
            try
            {
                var materias = _repository.GetMateriasPrimas(usuario);
                return materias;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetMateriasPrimas));
                throw;
            }
        }

        [Route("GetMateriaPrimaByID")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MateriaPrima))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<MateriaPrima> GetMateriaPrimaByID(int idMateriaPrima, string usuario)
        {
            try
            {
                var materia = _repository.GetMateriaPrimaByID(idMateriaPrima, usuario);
                return materia;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetMateriaPrimaByID));
                throw;
            }
        }

        [Route("InsertMateriaPrima")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MateriaPrima))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertMateriaPrima(MateriaPrima materiaPrima)
        {
            try
            {
                var res = _repository.InsertMateriaPrima(materiaPrima);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertMateriaPrima));
                throw;
            }
        }

        [Route("UpdateMateriaPrima")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(MateriaPrima))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdateMateriaPrima(MateriaPrima materiaPrima)
        {
            try
            {
                var res = _repository.UpdateMateriaPrima(materiaPrima);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdateMateriaPrima));
                throw;
            }
        }

        #endregion
    }
}
