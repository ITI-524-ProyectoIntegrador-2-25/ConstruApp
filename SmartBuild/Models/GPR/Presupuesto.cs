namespace Models.GPR
{
    public class Presupuesto : Base
    {
        public int? IDPresupuesto { get; set; }
        public int? ClienteID { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }
        public bool? Penalizacion { get; set; }
        public decimal? MontoPenalizacion { get; set; }
        public string? Descripcion { get; set; }
        public decimal? MateriaPrimaCotizada { get; set; }
        public decimal? ManoObraCotizada { get; set; }
        public decimal? MateriaPrimaCostoReal { get; set; }
        public decimal? ManoObraCostoReal { get; set; }
        public decimal? SubContratoCostoReal { get; set; }
        public decimal? OtrosGastos { get; set; }
        public DateTime? FechaFinReal { get; set; }
    }
}