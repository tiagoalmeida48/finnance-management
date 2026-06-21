using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.CreditCardInvoice.Application.Dto;
using Finnance.Api.Modules.CreditCardInvoice.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class CreditCardInvoiceController(ICreditCardInvoiceService creditCardInvoiceService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<CreditCardInvoiceDisplayDto>> GetByCard([FromQuery] long card, [FromQuery] int year = 0)
    {
        var invoices = creditCardInvoiceService.GetByCard(card, UserLogged.user, year);
        return new ResultApi<List<CreditCardInvoiceDisplayDto>> { Result = invoices.MapTo<List<CreditCardInvoiceDisplayDto>>() };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<CreditCardInvoiceDisplayDto> GetByMonth([FromQuery] long card, [FromQuery] string monthKey)
    {
        var invoice = creditCardInvoiceService.GetByMonth(card, monthKey, UserLogged.user);
        return new ResultApi<CreditCardInvoiceDisplayDto> { Result = invoice.MapTo<CreditCardInvoiceDisplayDto>() };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<bool> Recalculate([FromBody] long invoice)
    {
        creditCardInvoiceService.RecalculateInvoiceOwned(invoice, UserLogged.user);
        return new ResultApi<bool> { Result = true };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<bool> Reprocess([FromQuery] long card, [FromQuery] DateTime fromDate)
    {
        creditCardInvoiceService.ReprocessInvoicesForCard(card, UserLogged.user, fromDate);
        return new ResultApi<bool> { Result = true };
    }
}
