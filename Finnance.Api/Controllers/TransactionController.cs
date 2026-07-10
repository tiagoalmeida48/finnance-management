using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Modules.Transaction.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class TransactionController(ITransactionService transactionService) : ControllerBase
{
    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<List<TransactionDisplayDto>> List([FromBody] TransactionFilterDto filter)
    {
        var transactions = transactionService.GetPaginated(filter, UserLogged.user);
        return new ResultApi<List<TransactionDisplayDto>> { Result = transactions.MapTo<List<TransactionDisplayDto>>() };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<TransactionListResultDto> ListGrouped([FromBody] TransactionFilterDto filter)
    {
        return new ResultApi<TransactionListResultDto> { Result = transactionService.GetGroupedPaginated(filter, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<List<TransactionDisplayDto>> Recent([FromQuery] int quantity = 10)
    {
        var filter = new TransactionFilterDto { Limit = quantity, Offset = 0 };
        var transactions = transactionService.GetPaginated(filter, UserLogged.user);
        return new ResultApi<List<TransactionDisplayDto>> { Result = transactions.MapTo<List<TransactionDisplayDto>>() };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<TransactionDisplayDto> GetById([FromQuery] long transaction)
    {
        var entity = transactionService.GetById(transaction, UserLogged.user);
        return new ResultApi<TransactionDisplayDto> { Result = entity.MapTo<TransactionDisplayDto>() };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<TransactionSummaryDto> Summary([FromBody] TransactionFilterDto filter)
    {
        return new ResultApi<TransactionSummaryDto> { Result = transactionService.GetSummary(filter, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<List<TrackingMonthDto>> TrackingMonthly([FromQuery] int year)
    {
        return new ResultApi<List<TrackingMonthDto>> { Result = transactionService.GetMonthlyTracking(year, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<ImportPreviewResultDto> ImportPreview([FromBody] ImportPreviewDto dto)
    {
        return new ResultApi<ImportPreviewResultDto> { Result = transactionService.ParseImport(dto.Content, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<int> Import([FromBody] ImportDto dto)
    {
        return new ResultApi<int> { Result = transactionService.ImportTransactions(dto, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<object> Create([FromBody] TransactionCreateDto dto)
    {
        var result = transactionService.CreateTransaction(dto, UserLogged.user);
        return new ResultApi<object> { Result = new { id = result.Id, groupId = result.GroupId } };
    }

    [Authorization(subscription: true)]
    [HttpPut]
    public ResultApi<bool> Update([FromBody] TransactionUpdateDto dto)
    {
        return new ResultApi<bool> { Result = transactionService.UpdateTransaction(dto, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPut]
    public ResultApi<bool> TogglePaid([FromBody] long transaction)
    {
        return new ResultApi<bool> { Result = transactionService.TogglePaid(transaction, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpDelete]
    public ResultApi<bool> Delete([FromBody] long transaction)
    {
        return new ResultApi<bool> { Result = transactionService.DeleteTransaction(transaction, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<long> Duplicate([FromBody] long transaction)
    {
        return new ResultApi<long> { Result = transactionService.Duplicate(transaction, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<bool> BatchPay([FromBody] BatchPayDto dto)
    {
        return new ResultApi<bool> { Result = transactionService.BatchPay(dto.Ids, dto.Account, dto.PaymentDate, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<bool> PayBill([FromBody] PayBillDto dto)
    {
        return new ResultApi<bool> { Result = transactionService.PayBill(dto.Invoice, dto.Account, dto.PaymentDate, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<bool> BatchUnpay([FromBody] BatchIdsDto dto)
    {
        return new ResultApi<bool> { Result = transactionService.BatchUnpay(dto.Ids, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<bool> BatchDelete([FromBody] BatchIdsDto dto)
    {
        return new ResultApi<bool> { Result = transactionService.BatchDelete(dto.Ids, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<bool> BatchChangeDay([FromBody] BatchChangeDayDto dto)
    {
        return new ResultApi<bool> { Result = transactionService.BatchChangeDay(dto.Ids, dto.Day, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPost]
    public ResultApi<long> InsertInstallmentBetween([FromBody] long transaction)
    {
        return new ResultApi<long> { Result = transactionService.InsertInstallmentBetween(transaction, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpDelete]
    public ResultApi<bool> DeleteGroup([FromQuery] long groupId, [FromQuery] string type)
    {
        return new ResultApi<bool> { Result = transactionService.DeleteGroup(groupId, type, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpPut]
    public ResultApi<List<long>> UpdateGroup([FromBody] UpdateGroupDto dto)
    {
        return new ResultApi<List<long>> { Result = transactionService.UpdateGroup(dto, UserLogged.user) };
    }

    [Authorization(subscription: true)]
    [HttpGet]
    public ResultApi<string> ImportTemplate()
    {
        return new ResultApi<string> { Result = transactionService.GetImportTemplate() };
    }
}
