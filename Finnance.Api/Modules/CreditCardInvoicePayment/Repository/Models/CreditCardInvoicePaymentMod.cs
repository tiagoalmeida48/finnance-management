using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.CreditCardInvoicePayment.Repository.Models;

[Table("credit_card_invoice_payment")]
public class CreditCardInvoicePaymentMod : BaseModel
{
    [Key]
    [Column("credit_card_invoice_payment")]
    public long CreditCardInvoicePayment { get; set; }

    [Column("\"user\"")]
    public long User { get; set; }

    [Column("invoice")]
    public long Invoice { get; set; }

    [Column("account")]
    public long? Account { get; set; }

    [Column("payment_method")]
    public long? PaymentMethod { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("paid_at")]
    public DateTime PaidAt { get; set; }

    [Column("notes")]
    public string Notes { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
