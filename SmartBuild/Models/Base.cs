using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Base
    {
        public string? Usuario { get; set; }

        public string? QuienIngreso { get; set; } 
        public DateTime? CuandoIngreso { get; set; }
        public string? QuienModifico { get; set; }
        public DateTime? CuandoModifico { get; set; }
    }
}
