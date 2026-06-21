using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.PaymentMethod.Domain.Entities;

namespace Finnance.Api.Modules.PaymentMethod.Application.Interfaces;

public interface IPaymentMethodService : IBaseService<PaymentMethodEntity>
{
    List<PaymentMethodEntity> List();

    PaymentMethodEntity Get(long paymentMethod);

    bool Exist(long paymentMethod);
}
