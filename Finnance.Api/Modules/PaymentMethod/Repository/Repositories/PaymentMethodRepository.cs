using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.PaymentMethod.Domain.Entities;
using Finnance.Api.Modules.PaymentMethod.Domain.Interfaces;
using Finnance.Api.Modules.PaymentMethod.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.PaymentMethod.Repository.Repositories;

public class PaymentMethodRepository : BaseRepository<PaymentMethodEntity, PaymentMethodMod>, IPaymentMethodRepository
{
    public List<PaymentMethodEntity> Search(long paymentMethod = 0,
                                            string name = null,
                                            bool active = false,
                                            int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM payment_method WHERE 1 = 1 ");

        if (paymentMethod > 0)
        {
            param.Add("payment_method", paymentMethod);
            sb.Append("AND payment_method = @payment_method ");
        }

        if (name.IsNotEmpty())
        {
            param.Add("name", name);
            sb.Append("AND name = @name ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<PaymentMethodMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
