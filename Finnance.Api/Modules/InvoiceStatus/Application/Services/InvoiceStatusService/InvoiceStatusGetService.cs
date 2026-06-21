using Finnance.Api.Modules.InvoiceStatus.Domain.Entities;

namespace Finnance.Api.Modules.InvoiceStatus.Application.Services;

public partial class InvoiceStatusService
{
    public List<InvoiceStatusEntity> List()
    {
        return invoiceStatusRepository.Search(active: true);
    }

    public InvoiceStatusEntity Get(long invoiceStatus)
    {
        return invoiceStatusRepository.Search(invoiceStatus, active: true, quantity: 1).FirstOrDefault();
    }

    public bool Exist(long invoiceStatus)
    {
        return Get(invoiceStatus) != null;
    }
}
