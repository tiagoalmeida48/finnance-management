using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.CreditCardInvoicePayment.Application.Dto;
using Finnance.Api.Modules.CreditCardInvoicePayment.Application.Interfaces;
using Finnance.Api.Modules.CreditCardInvoicePayment.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class CreditCardInvoicePaymentController(ICreditCardInvoicePaymentService creditCardInvoicePaymentService) : ControllerBase
{
    [Authorization]
    [HttpGet]
    public ResultApi<List<CreditCardInvoicePaymentDisplayDto>> ListByInvoice([FromQuery] long invoice)
    {
        var result = creditCardInvoicePaymentService.ListByInvoice(invoice, UserLogged.user);
        return new ResultApi<List<CreditCardInvoicePaymentDisplayDto>> { Result = result.MapTo<List<CreditCardInvoicePaymentDisplayDto>>() };
    }

    [Authorization]
    [HttpPost]
    public ResultApi<long> Create([FromBody] CreditCardInvoicePaymentCreateDto dto)
    {
        var entity = new CreditCardInvoicePaymentEntity
        {
            Invoice = dto.Invoice,
            Account = dto.Account,
            PaymentMethod = dto.PaymentMethod,
            Amount = dto.Amount,
            PaidAt = dto.PaidAt ?? default,
            Notes = dto.Notes
        };

        var id = creditCardInvoicePaymentService.RegisterPayment(entity, UserLogged.user);
        return new ResultApi<long> { Result = id };
    }

    [Authorization]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long creditCardInvoicePayment)
    {
        return new ResultApi<bool> { Result = creditCardInvoicePaymentService.Delete(creditCardInvoicePayment, UserLogged.user) };
    }
}
