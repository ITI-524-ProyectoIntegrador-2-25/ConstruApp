namespace Models.GPR
{
    public class PlanillaDetalle : Base
    {
        public int? IDDetallePlanilla { get; set; }
        public int? PlanillaID { get; set; }
        public int? EmpleadoID { get; set; }
        public int? PresupuestoID { get; set; }
        public DateTime? Fecha { get; set; }
        public decimal? SalarioHora { get; set; }
        public decimal? HorasOrdinarias { get; set; }
        public decimal? HorasExtras { get; set; }
        public decimal? HorasDobles { get; set; }
        public string? Detalle { get; set; }
    }
}