using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CreditCardStatementCycle.Repository.Models;

[Table("credit_card_statement_cycle")]
public class CreditCardStatementCycleMod : BaseModel
{
    [Key]
    [Column("credit_card_statement_cycle")]
    public long CreditCardStatementCycle { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("card")]
    public long Card { get; set; }

    [Column("date_start")]
    public DateTime DateStart { get; set; }

    [Column("date_end")]
    public DateTime DateEnd { get; set; }

    [Column("closing_day")]
    public short ClosingDay { get; set; }

    [Column("due_day")]
    public short DueDay { get; set; }

    [Column("notes")]
    public string Notes { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
