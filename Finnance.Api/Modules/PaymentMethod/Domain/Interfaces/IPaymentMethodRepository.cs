using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.PaymentMethod.Domain.Entities;

namespace Finnance.Api.Modules.PaymentMethod.Domain.Interfaces;

public interface IPaymentMethodRepository : IBaseRepository<PaymentMethodEntity>
{
    List<PaymentMethodEntity> Search(long paymentMethod = 0,
                                     string name = null,
                                     bool active = false,
                                     int quantity = 0);
}
