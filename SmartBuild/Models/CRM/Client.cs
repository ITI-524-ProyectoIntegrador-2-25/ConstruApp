namespace Models.CRM
{
    public class Cliente : Base
    {
        public int? IDCliente { get; set; }
        public string? RazonSocial { get; set; }
        public string? Identificacion { get; set; }
        public string? Tipo { get; set; }

        public string? NombreContacto { get; set; }
        public string? CorreoContacto { get; set; }
        public string? TelefonoContacto { get; set; }
    }
}
