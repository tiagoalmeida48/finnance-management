using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.AccountType.Application.Dto;
using Finnance.Api.Modules.AccountType.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class AccountTypeController(IAccountTypeService accountTypeService) : ControllerBase
{
    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<List<AccountTypeDisplayDto>> List()
    {
        return new ResultApi<List<AccountTypeDisplayDto>> { Result = accountTypeService.List().MapTo<List<AccountTypeDisplayDto>>() };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<AccountTypeDisplayDto> Get(long id)
    {
        return new ResultApi<AccountTypeDisplayDto> { Result = accountTypeService.Get(id).MapTo<AccountTypeDisplayDto>() };
    }
}
