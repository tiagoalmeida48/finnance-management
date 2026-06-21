using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.InvoiceStatus.Domain.Entities;

namespace Finnance.Api.Modules.InvoiceStatus.Domain.Interfaces;

public interface IInvoiceStatusRepository : IBaseRepository<InvoiceStatusEntity>
{
    List<InvoiceStatusEntity> Search(long invoiceStatus = 0,
                                     string name = null,
                                     bool active = false,
                                     int quantity = 0);
}
