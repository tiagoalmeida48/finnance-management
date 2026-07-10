using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.BankAccount.Application.Dto;
using Finnance.Api.Modules.BankAccount.Application.Interfaces;
using Finnance.Api.Modules.BankAccount.Domain.Entities;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class BankAccountController(IBankAccountService bankAccountService) : ControllerBase
{
    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<List<BankAccountDisplayDto>> List([FromQuery] bool includeInactive = false)
    {
        var accounts = bankAccountService.List(UserLogged.user, includeInactive);
        return new ResultApi<List<BankAccountDisplayDto>> { Result = accounts.MapTo<List<BankAccountDisplayDto>>() };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<BankAccountDisplayDto> Get([FromQuery] long bankAccount)
    {
        var account = bankAccountService.Get(bankAccount, UserLogged.user);
        return new ResultApi<BankAccountDisplayDto> { Result = account.MapTo<BankAccountDisplayDto>() };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<long> Create([FromBody] BankAccountCreateDto dto)
    {
        var entity = new BankAccountEntity
        {
            Name = dto.Name,
            AccountType = dto.AccountType,
            InitialBalance = dto.InitialBalance,
            Color = dto.Color,
            Icon = dto.Icon,
            Notes = dto.Notes
        };
        var id = bankAccountService.CreateAccount(entity, UserLogged.user);
        return new ResultApi<long> { Result = id };
    }

    [Authorization(subscription: true)]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] BankAccountUpdateDto dto)
    {
        var entity = new BankAccountEntity
        {
            BankAccount = dto.BankAccount,
            Name = dto.Name,
            AccountType = dto.AccountType,
            Color = dto.Color,
            Icon = dto.Icon,
            Notes = dto.Notes,
            Active = dto.Active
        };
        return new ResultApi<bool> { Result = bankAccountService.UpdateAccount(entity, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long bankAccount)
    {
        return new ResultApi<bool> { Result = bankAccountService.DeleteAccount(bankAccount, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPut]
    public ResultApi<bool> ToggleActive([FromBody] long bankAccount)
    {
        return new ResultApi<bool> { Result = bankAccountService.ToggleActive(bankAccount, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<int> Reconcile()
    {
        return new ResultApi<int> { Result = bankAccountService.ReconcileBalances(UserLogged.user) };
    }
}
