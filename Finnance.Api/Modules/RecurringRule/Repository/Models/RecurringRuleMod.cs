using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.RecurringRule.Repository.Models;

[Table("recurring_rule")]
public class RecurringRuleMod : BaseModel
{
    [Key]
    [Column("recurring_rule")]
    public long RecurringRule { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("description")]
    public string Description { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("transaction_type")]
    public long TransactionType { get; set; }

    [Column("category")]
    public long? Category { get; set; }

    [Column("account")]
    public long? Account { get; set; }

    [Column("card")]
    public long? Card { get; set; }

    [Column("payment_method")]
    public long? PaymentMethod { get; set; }

    [Column("day_of_month")]
    public short DayOfMonth { get; set; }

    [Column("frequency")]
    public short Frequency { get; set; }

    [Column("date_start")]
    public DateTime DateStart { get; set; }

    [Column("date_end")]
    public DateTime DateEnd { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
