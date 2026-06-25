using Finnance.Api.Modules.BankAccount.Application.Interfaces;
using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.CreditCard.Application.Interfaces;
using Finnance.Api.Modules.CreditCard.Domain.Entities;
using Finnance.Api.Modules.CreditCard.Domain.Interfaces;
using Finnance.Api.Modules.CreditCardStatementCycle.Application.Interfaces;

namespace Finnance.Api.Modules.CreditCard.Application.Services;

public partial class CreditCardService(ICreditCardRepository creditCardRepository, IBankAccountService bankAccountService, ICreditCardStatementCycleService creditCardStatementCycleService)
    : BaseService<CreditCardEntity>(creditCardRepository), ICreditCardService
{
    public long CreateCard(CreditCardEntity entity, short closingDay, short dueDay, long userId)
    {
        entity.User = userId;
        entity.ValidateCreate();

        bankAccountService.Get(entity.BankAccount, userId);

        using var tran = GetTransaction();
        var id = creditCardRepository.Create(entity);
        creditCardStatementCycleService.CreateInitialCycle(id, userId, DateTime.Today, closingDay, dueDay, null);
        tran.Complete();
        return id;
    }

    public bool UpdateCard(CreditCardEntity entity, long userId)
    {
        entity.ValidateUpdate();

        bankAccountService.Get(entity.BankAccount, userId);

        var current = GetCard(entity.CreditCard, userId);
        current.BankAccount = entity.BankAccount;
        current.Name = entity.Name;
        current.Color = entity.Color;
        current.CreditLimit = entity.CreditLimit;
        current.Notes = entity.Notes;
        current.Active = entity.Active;

        using var tran = GetTransaction();
        creditCardRepository.Update(current);
        tran.Complete();
        return true;
    }

    public bool DeleteCard(long creditCard, long userId)
    {
        var current = GetCard(creditCard, userId);
        current.Active = false;

        using var tran = GetTransaction();
        creditCardRepository.Update(current);
        tran.Complete();
        return true;
    }
}
