namespace Models.GPR
{
    public class Usuario : Base
    {
        public int? IDUsuario { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Correo { get; set; }
        public string? Contrasena { get; set; }
        public string? Puesto { get; set; }
        public string? Rol { get; set; }
        public Boolean? Estado { get; set; }

    }
}