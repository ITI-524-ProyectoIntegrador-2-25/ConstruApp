namespace Models.GPR
{
    public class Actividad : Base
    {
        public int? IDActividad { get; set; }
        public int? ActividadID { get; set; }
        public int? PresupuestoID { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? FechaInicioProyectada { get; set; }
        public DateTime? FechaFinProyectada { get; set; }
        public DateTime? FechaInicioReal { get; set; }
        public DateTime? FechaFinReal { get; set; }
        public string? Estado { get; set; }
    }
}