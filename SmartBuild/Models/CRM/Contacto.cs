namespace Models.CRM
{
    public class Contacto : Base
    {
        public int? IDContacto { get; set; }
        public int? ClientID { get; set; }
        public int? SubcontratoID { get; set; }
        public string? Nombre { get; set; }
        public string? PrimerApellido { get; set; }
        public string? SegundoApellido { get; set; }
        public string? Telefono { get; set; }
        public string? CorreoElectronico { get; set; }
        public int? EsPrincipal { get; set; } // 1 = Si, 0 = No

        public string? NombreCompleto { get; set; }
    }
}
