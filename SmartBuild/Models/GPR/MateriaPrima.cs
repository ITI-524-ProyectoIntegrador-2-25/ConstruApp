namespace Models.GPR
{
    public class MateriaPrima : Base
    {
        public int? IDMateriaPrima { get; set; }
        public int? PresupuestoID { get; set; }
        public string? Proveedor { get; set; }
        public string? Descripcion { get; set; }
        public decimal? CostoUnitario { get; set; }
        public decimal? Cantidad { get; set; }
        public decimal? CantidadMinima { get; set; }
        public string? UnidadMedida { get; set; }
        public bool? Planificado { get; set; }

    }
}
