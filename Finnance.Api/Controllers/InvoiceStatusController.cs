using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.InvoiceStatus.Application.Dto;
using Finnance.Api.Modules.InvoiceStatus.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class InvoiceStatusController(IInvoiceStatusService invoiceStatusService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<InvoiceStatusDisplayDto>> List()
    {
        var result = invoiceStatusService.List().Select(x => x.MapTo<InvoiceStatusDisplayDto>()).ToList();
        return new ResultApi<List<InvoiceStatusDisplayDto>> { Result = result };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<InvoiceStatusDisplayDto> Get([FromQuery] long invoiceStatus)
    {
        var entity = invoiceStatusService.Get(invoiceStatus);

        if (entity == null)
            throw new ApplicationException(Constants.ErrorMessage.RegisterNotFound);

        return new ResultApi<InvoiceStatusDisplayDto> { Result = entity.MapTo<InvoiceStatusDisplayDto>() };
    }
}
