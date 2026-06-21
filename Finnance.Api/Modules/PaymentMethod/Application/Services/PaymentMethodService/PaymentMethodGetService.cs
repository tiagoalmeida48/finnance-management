using Finnance.Api.Modules.PaymentMethod.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.PaymentMethod.Application.Services;

public partial class PaymentMethodService
{
    public List<PaymentMethodEntity> List()
    {
        return paymentMethodRepository.Search(active: true);
    }

    public PaymentMethodEntity Get(long paymentMethod)
    {
        var entity = paymentMethodRepository.Search(paymentMethod, active: true, quantity: 1).FirstOrDefault();

        if (entity == null)
            throw new ApplicationException(Constants.ErrorMessage.PaymentMethodNotFound);

        return entity;
    }

    public bool Exist(long paymentMethod)
    {
        return paymentMethodRepository.Search(paymentMethod, active: true, quantity: 1).Any();
    }
}
