using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.CreditCardStatementCycle.Application.Dto;
using Finnance.Api.Modules.CreditCardStatementCycle.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class CreditCardStatementCycleController(ICreditCardStatementCycleService creditCardStatementCycleService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<StatementCycleDisplayDto>> GetByCard([FromQuery] long card)
    {
        var cycles = creditCardStatementCycleService.GetByCard(card, UserLogged.user);
        return new ResultApi<List<StatementCycleDisplayDto>> { Result = cycles.MapTo<List<StatementCycleDisplayDto>>() };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<long> Create([FromBody] StatementCycleCreateDto dto)
    {
        var id = creditCardStatementCycleService.CreateInitialCycle(dto.Card, UserLogged.user, dto.DateStart, dto.ClosingDay, dto.DueDay, dto.Notes);
        return new ResultApi<long> { Result = id };
    }

    [Authorization()]
    [HttpPost]
    public ResultApi<long> InsertCycle([FromBody] StatementCycleCreateDto dto)
    {
        var id = creditCardStatementCycleService.InsertCycle(dto.Card, UserLogged.user, dto.DateStart, dto.ClosingDay, dto.DueDay, dto.Notes);
        return new ResultApi<long> { Result = id };
    }

    [Authorization()]
    [HttpPut]
    public ResultApi<bool> UpdateStart([FromQuery] long cycle, [FromQuery] DateTime dateStart)
    {
        return new ResultApi<bool> { Result = creditCardStatementCycleService.UpdateCycleStart(cycle, UserLogged.user, dateStart) };
    }

    [Authorization()]
    [HttpPut]
    public ResultApi<bool> UpdateEnd([FromQuery] long cycle, [FromQuery] DateTime dateEnd)
    {
        return new ResultApi<bool> { Result = creditCardStatementCycleService.UpdateCycleEnd(cycle, UserLogged.user, dateEnd) };
    }
}
