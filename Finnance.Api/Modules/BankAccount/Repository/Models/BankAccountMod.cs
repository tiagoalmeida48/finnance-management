using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.BankAccount.Repository.Models;

[Table("bank_account")]
public class BankAccountMod : BaseModel
{
    [Key]
    [Column("bank_account")]
    public long BankAccount { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("account_type")]
    public long AccountType { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("initial_balance")]
    public decimal InitialBalance { get; set; }

    [Column("current_balance")]
    public decimal CurrentBalance { get; set; }

    [Column("color")]
    public string Color { get; set; }

    [Column("icon")]
    public string Icon { get; set; }

    [Column("notes")]
    public string Notes { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
