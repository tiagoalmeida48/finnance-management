using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.TransactionType.Repository.Models;

[Table("transaction_type")]
public class TransactionTypeMod : BaseModel
{
    [Key]
    [Column("transaction_type")]
    public long TransactionType { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
