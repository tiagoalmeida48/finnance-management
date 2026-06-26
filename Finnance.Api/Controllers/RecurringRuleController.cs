using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.RecurringRule.Application.Dto;
using Finnance.Api.Modules.RecurringRule.Application.Interfaces;
using Finnance.Api.Modules.RecurringRule.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class RecurringRuleController(IRecurringRuleService recurringRuleService) : ControllerBase
{
    [Authorization]
    [HttpGet]
    public ResultApi<List<RecurringRuleDisplayDto>> List()
    {
        var result = recurringRuleService.List(UserLogged.user);
        return new ResultApi<List<RecurringRuleDisplayDto>> { Result = result.MapTo<List<RecurringRuleDisplayDto>>() };
    }

    [Authorization]
    [HttpGet]
    public ResultApi<RecurringRuleDisplayDto> Get([FromQuery] long recurringRule)
    {
        var result = recurringRuleService.Get(recurringRule, UserLogged.user);
        return new ResultApi<RecurringRuleDisplayDto> { Result = result.MapTo<RecurringRuleDisplayDto>() };
    }

    [Authorization]
    [HttpPost]
    public ResultApi<long> Create([FromBody] RecurringRuleCreateDto dto)
    {
        var entity = new RecurringRuleEntity
        {
            Description = dto.Description,
            Amount = dto.Amount,
            TransactionType = dto.TransactionType,
            Category = dto.Category,
            Account = dto.Account,
            Card = dto.Card,
            PaymentMethod = dto.PaymentMethod,
            DayOfMonth = dto.DayOfMonth,
            Frequency = dto.Frequency,
            DateStart = dto.DateStart,
            DateEnd = dto.DateEnd ?? default
        };

        var id = recurringRuleService.Create(entity, UserLogged.user);

        if (dto.GenerateUntil.HasValue)
            recurringRuleService.GenerateOccurrences(id, UserLogged.user, dto.GenerateUntil.Value);

        return new ResultApi<long> { Result = id };
    }

    [Authorization]
    [HttpPost]
    public ResultApi<int> Generate([FromQuery] long recurringRule, [FromQuery] DateTime until)
    {
        var generated = recurringRuleService.GenerateOccurrences(recurringRule, UserLogged.user, until);
        return new ResultApi<int> { Result = generated };
    }

    [Authorization]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long recurringRule)
    {
        return new ResultApi<bool> { Result = recurringRuleService.Delete(recurringRule, UserLogged.user) };
    }
}
