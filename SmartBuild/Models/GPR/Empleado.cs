namespace Models.GPR
{
    public class Empleado : Base
    {
        public int? IDEmpleado { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Identificacion { get; set; }
        public string? Puesto { get; set; }
        public string? SalarioHora { get; set; }
        public string? FechaIngreso { get; set; }
        public string? Correo { get; set; }

        public string? Activo { get; set; }
    }
}