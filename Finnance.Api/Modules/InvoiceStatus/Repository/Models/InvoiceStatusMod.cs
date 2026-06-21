using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.InvoiceStatus.Repository.Models;

[Table("invoice_status")]
public class InvoiceStatusMod : BaseModel
{
    [Key]
    [Column("invoice_status")]
    public long InvoiceStatus { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
