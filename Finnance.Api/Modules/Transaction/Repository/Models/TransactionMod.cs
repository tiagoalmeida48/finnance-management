using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Transaction.Repository.Models;

[Table("\"transaction\"")]
public class TransactionMod : BaseModel
{
    [Key]
    [Column("\"transaction\"")]
    public long Transaction { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("transaction_type")]
    public long TransactionType { get; set; }

    [Column("payment_method")]
    public long? PaymentMethod { get; set; }

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("payment_date")]
    public DateTime? PaymentDate { get; set; }

    [Column("purchase_date")]
    public DateTime? PurchaseDate { get; set; }

    [Column("description")]
    public string Description { get; set; }

    [Column("account")]
    public long? Account { get; set; }

    [Column("to_account")]
    public long? ToAccount { get; set; }

    [Column("card")]
    public long? Card { get; set; }

    [Column("category")]
    public long? Category { get; set; }

    [Column("invoice")]
    public long? Invoice { get; set; }

    [Column("installment_group")]
    public long? InstallmentGroup { get; set; }

    [Column("installment_number")]
    public int? InstallmentNumber { get; set; }

    [Column("recurring_group")]
    public long? RecurringGroup { get; set; }

    [Column("fixed")]
    public bool Fixed { get; set; }

    [Column("paid")]
    public bool Paid { get; set; }

    [Column("notes")]
    public string Notes { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
