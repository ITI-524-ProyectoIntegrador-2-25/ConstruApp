namespace Models.GPR
{
    public class PagoSubContrato : Base
    {
        public int? IDPago { get; set; }
        public int? SubcontratoID { get; set; }
        public decimal? MontoPagado { get; set; }
        public DateTime? FechaPago { get; set; }

    }
}
