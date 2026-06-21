using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.InvoiceStatus.Domain.Entities;

namespace Finnance.Api.Modules.InvoiceStatus.Application.Interfaces;

public interface IInvoiceStatusService : IBaseService<InvoiceStatusEntity>
{
    List<InvoiceStatusEntity> List();

    InvoiceStatusEntity Get(long invoiceStatus);

    bool Exist(long invoiceStatus);
}
