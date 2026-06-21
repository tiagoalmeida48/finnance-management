using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.PaymentMethod.Repository.Models;

[Table("payment_method")]
public class PaymentMethodMod : BaseModel
{
    [Key]
    [Column("payment_method")]
    public long PaymentMethod { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
