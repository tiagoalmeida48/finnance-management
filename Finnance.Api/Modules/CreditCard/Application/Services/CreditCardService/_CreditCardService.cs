using Finnance.Api.Modules.BankAccount.Application.Interfaces;
using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.CreditCard.Application.Interfaces;
using Finnance.Api.Modules.CreditCard.Domain.Entities;
using Finnance.Api.Modules.CreditCard.Domain.Interfaces;

namespace Finnance.Api.Modules.CreditCard.Application.Services;

public partial class CreditCardService(ICreditCardRepository creditCardRepository, IBankAccountService bankAccountService)
    : BaseService<CreditCardEntity>(creditCardRepository), ICreditCardService
{
    public long CreateCard(CreditCardEntity entity, long userId)
    {
        entity.User = userId;
        entity.ValidateCreate();

        bankAccountService.Get(entity.BankAccount, userId);

        using var tran = GetTransaction();
        var id = creditCardRepository.Create(entity);
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

        using var tran = GetTransaction();
        creditCardRepository.Delete(current);
        tran.Complete();
        return true;
    }
}
