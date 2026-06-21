using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.PaymentMethod.Domain.Entities;

public class PaymentMethodEntity : BaseEntity
{
    public long PaymentMethod { get; set; }

    public string Name { get; set; }

    public bool Active { get; set; }
}
