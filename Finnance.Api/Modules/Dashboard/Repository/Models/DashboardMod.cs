using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Dashboard.Repository.Models;

[Table("bank_account")]
public class DashboardMod : BaseModel
{
    [Key]
    [Column("bank_account")]
    public long BankAccount { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }
}
