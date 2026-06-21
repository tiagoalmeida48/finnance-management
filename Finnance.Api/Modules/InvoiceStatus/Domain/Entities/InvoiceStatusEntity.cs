using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.InvoiceStatus.Domain.Entities;

public class InvoiceStatusEntity : BaseEntity
{
    public long InvoiceStatus { get; set; }

    public string Name { get; set; }

    public bool Active { get; set; }
}
