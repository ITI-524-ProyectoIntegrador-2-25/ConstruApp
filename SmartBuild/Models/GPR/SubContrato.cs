namespace Models.GPR
{
    public class SubContrato : Base
    {
        public int? IDSubcontrato { get; set; }
        public int? ContactoID { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? FechaInicioProyectada { get; set; }
        public DateTime? FechaFinProyectada { get; set; }
        public DateTime? FechaInicioReal { get; set; }
        public DateTime? FechaFinReal { get; set; }
        public decimal? PorcentajeAvance { get; set; }
        public decimal? MontoCotizado { get; set; }
    }
}
