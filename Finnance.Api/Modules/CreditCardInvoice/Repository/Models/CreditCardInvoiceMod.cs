using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CreditCardInvoice.Repository.Models;

[Table("credit_card_invoice")]
public class CreditCardInvoiceMod : BaseModel
{
    [Key]
    [Column("credit_card_invoice")]
    public long CreditCardInvoice { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("card")]
    public long Card { get; set; }

    [Column("invoice_status")]
    public long InvoiceStatus { get; set; }

    [Column("month_key")]
    public string MonthKey { get; set; }

    [Column("closing_date")]
    public DateTime? ClosingDate { get; set; }

    [Column("due_date")]
    public DateTime? DueDate { get; set; }

    [Column("total_amount")]
    public decimal TotalAmount { get; set; }

    [Column("paid_amount")]
    public decimal PaidAmount { get; set; }

    [Column("closed_at")]
    public DateTime? ClosedAt { get; set; }

    [Column("paid_at")]
    public DateTime? PaidAt { get; set; }

    [Column("active")]
    public bool Active { get; set; }

    [Computed]
    [Column("items_count")]
    public int ItemsCount { get; set; }
}
