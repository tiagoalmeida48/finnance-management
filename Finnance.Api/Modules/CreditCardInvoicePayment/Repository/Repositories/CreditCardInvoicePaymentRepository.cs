using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Entities;
using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Interfaces;
using Finnance.Api.Modules.CreditCardInvoicePayment.Repository.Models;
using System.Text;

namespace Finnance.Api.Modules.CreditCardInvoicePayment.Repository.Repositories;

public class CreditCardInvoicePaymentRepository : BaseRepository<CreditCardInvoicePaymentEntity, CreditCardInvoicePaymentMod>, ICreditCardInvoicePaymentRepository
{
    public List<CreditCardInvoicePaymentEntity> Search(long creditCardInvoicePayment = 0, long user = 0, long invoice = 0, bool active = false, int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM credit_card_invoice_payment WHERE 1 = 1 ");

        if (creditCardInvoicePayment > 0)
        {
            param.Add("creditCardInvoicePayment", creditCardInvoicePayment);
            sb.Append("AND credit_card_invoice_payment = @creditCardInvoicePayment ");
        }

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (invoice > 0)
        {
            param.Add("invoice", invoice);
            sb.Append("AND invoice = @invoice ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        sb.Append("ORDER BY paid_at DESC ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<CreditCardInvoicePaymentMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
