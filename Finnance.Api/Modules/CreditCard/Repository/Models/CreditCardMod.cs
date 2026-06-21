using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CreditCard.Repository.Models;

[Table("credit_card")]
public class CreditCardMod : BaseModel
{
    [Key]
    [Column("credit_card")]
    public long CreditCard { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("bank_account")]
    public long BankAccount { get; set; }

    [Column("name")]
    public string Name { get; set; }

    [Column("color")]
    public string Color { get; set; }

    [Column("credit_limit")]
    public decimal CreditLimit { get; set; }

    [Column("notes")]
    public string Notes { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
