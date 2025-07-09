using DataAccessLogic;
using Microsoft.AspNetCore.Mvc;
using Models.CRM;
using Models.GNR;

namespace SmartBuild.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ContactApiController : Controller
    {
        private readonly ILogger<ContactApiController> _logger;
        private readonly ICRMConnectionDB _repository;

        public ContactApiController(ILogger<ContactApiController> logger, ICRMConnectionDB repository)
        {
            _logger = logger;
            _repository = repository;
        }

        #region Contactos
        [Route("GetContacts")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Contacto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Contacto> GetContacts(string usuario)
        {
            try
            {
                var contactData = _repository.GetContacts(usuario);
                return contactData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetContacts));
                throw;
            }
        }

        [Route("GetContactInfo")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Contacto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Contacto> GetContactInfo(int idContacto, string usuario)
        {
            try
            {
                var contactData = _repository.GetContactInfo(idContacto, usuario);
                return contactData;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(GetContactInfo));
                throw;
            }
        }

        [Route("InsertContact")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Contacto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> InsertContact(Contacto contacto)
        {
            try
            {
                var res = _repository.InsertContact(contacto);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(InsertContact));
                throw;
            }
        }

        [Route("UpdateContact")]
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Contacto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public List<Response> UpdateContact(Contacto contacto)
        {
            try
            {
                var res = _repository.UpdateContact(contacto);
                return res;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(UpdateContact));
                throw;
            }
        }
        #endregion
    }
}
