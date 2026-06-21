using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.CreditCard.Application.Dto;
using Finnance.Api.Modules.CreditCard.Application.Interfaces;
using Finnance.Api.Modules.CreditCard.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class CreditCardController(ICreditCardService creditCardService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<CreditCardDisplayDto>> List()
    {
        var cards = creditCardService.List(UserLogged.user);
        return new ResultApi<List<CreditCardDisplayDto>> { Result = cards.MapTo<List<CreditCardDisplayDto>>() };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<CreditCardDisplayDto> Get([FromQuery] long creditCard)
    {
        var card = creditCardService.GetCard(creditCard, UserLogged.user);
        return new ResultApi<CreditCardDisplayDto> { Result = card.MapTo<CreditCardDisplayDto>() };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<long> Create([FromBody] CreditCardCreateDto dto)
    {
        var entity = new CreditCardEntity
        {
            BankAccount = dto.BankAccount,
            Name = dto.Name,
            Color = dto.Color,
            CreditLimit = dto.CreditLimit,
            Notes = dto.Notes
        };
        var id = creditCardService.CreateCard(entity, UserLogged.user);
        return new ResultApi<long> { Result = id };
    }

    [Authorization()]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] CreditCardUpdateDto dto)
    {
        var entity = new CreditCardEntity
        {
            CreditCard = dto.CreditCard,
            BankAccount = dto.BankAccount,
            Name = dto.Name,
            Color = dto.Color,
            CreditLimit = dto.CreditLimit,
            Notes = dto.Notes,
            Active = dto.Active
        };
        return new ResultApi<bool> { Result = creditCardService.UpdateCard(entity, UserLogged.user) };
    }

    [Authorization()]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long creditCard)
    {
        return new ResultApi<bool> { Result = creditCardService.DeleteCard(creditCard, UserLogged.user) };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<CreditCardStatsDto> Stats([FromQuery] long creditCard)
    {
        return new ResultApi<CreditCardStatsDto> { Result = creditCardService.GetStats(creditCard, UserLogged.user) };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<List<CreditCardStatsDto>> AllStats()
    {
        return new ResultApi<List<CreditCardStatsDto>> { Result = creditCardService.GetAllStats(UserLogged.user) };
    }
}
