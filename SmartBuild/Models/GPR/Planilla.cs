namespace Models.GPR
{
    public class Planilla : Base
    {
        public int? IDPlanilla { get; set; }
        public string? Nombre { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public string? Estado { get; set; }

    }
}