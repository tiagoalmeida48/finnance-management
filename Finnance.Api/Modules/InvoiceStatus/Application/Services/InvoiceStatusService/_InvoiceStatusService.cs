using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.InvoiceStatus.Application.Interfaces;
using Finnance.Api.Modules.InvoiceStatus.Domain.Entities;
using Finnance.Api.Modules.InvoiceStatus.Domain.Interfaces;

namespace Finnance.Api.Modules.InvoiceStatus.Application.Services;

public partial class InvoiceStatusService(IInvoiceStatusRepository invoiceStatusRepository) : BaseService<InvoiceStatusEntity>(invoiceStatusRepository), IInvoiceStatusService;
