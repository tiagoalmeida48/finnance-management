using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.TransactionType.Application.Dto;
using Finnance.Api.Modules.TransactionType.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class TransactionTypeController(ITransactionTypeService transactionTypeService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<List<TransactionTypeDisplayDto>> List()
    {
        var result = transactionTypeService.List().Select(x => x.MapTo<TransactionTypeDisplayDto>()).ToList();
        return new ResultApi<List<TransactionTypeDisplayDto>> { Result = result };
    }

    [Authorization()]
    [HttpGet]
    public ResultApi<TransactionTypeDisplayDto> Get([FromQuery] long transactionType)
    {
        return new ResultApi<TransactionTypeDisplayDto> { Result = transactionTypeService.Get(transactionType).MapTo<TransactionTypeDisplayDto>() };
    }
}
