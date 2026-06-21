using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.AccountType.Repository.Models;

[Table("account_type")]
public class AccountTypeMod : BaseModel
{
    [Key]
    [Column("account_type")]
    public long AccountType { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
