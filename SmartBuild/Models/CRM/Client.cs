namespace Models.CRM
{
    public class Cliente
    {
        public int? IDCliente { get; set; }
        public int? ContactoID { get; set; }
        public string? RazonSocial { get; set; }
        public string? Identificacion { get; set; }
        

        public string? NombreContacto { get; set; }

        public string? Usuario { get; set; }
    }
}
