using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.PaymentMethod.Application.Dto;
using Finnance.Api.Modules.PaymentMethod.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class PaymentMethodController(IPaymentMethodService paymentMethodService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<PaymentMethodDisplayDto>> List()
    {
        return new ResultApi<List<PaymentMethodDisplayDto>> { Result = paymentMethodService.List().MapTo<List<PaymentMethodDisplayDto>>() };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<PaymentMethodDisplayDto> Get([FromQuery] long paymentMethod)
    {
        return new ResultApi<PaymentMethodDisplayDto> { Result = paymentMethodService.Get(paymentMethod).MapTo<PaymentMethodDisplayDto>() };
    }
}
