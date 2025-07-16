namespace Models.GPR
{
    public class GastoAdicional : Base
    {
        public int IDGasto { get; set; }
        public int PresupuestoID { get; set; }
        public DateTime Fecha { get; set; }
        public string Descripcion { get; set; }
        public decimal Monto { get; set; }
        public string EstadoPago { get; set; }

    }
}
