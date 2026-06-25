using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.BankAccount.Application.Interfaces;
using Finnance.Api.Modules.BankAccount.Domain.Entities;
using Finnance.Api.Modules.BankAccount.Domain.Interfaces;

namespace Finnance.Api.Modules.BankAccount.Application.Services;

public partial class BankAccountService(IBankAccountRepository bankAccountRepository)
    : BaseService<BankAccountEntity>(bankAccountRepository), IBankAccountService
{
    public long CreateAccount(BankAccountEntity entity, long userId)
    {
        entity.User = userId;
        entity.ValidateCreate();

        using var tran = GetTransaction();
        var id = bankAccountRepository.Create(entity);
        tran.Complete();
        return id;
    }

    public bool UpdateAccount(BankAccountEntity entity, long userId)
    {
        entity.ValidateUpdate();

        var current = Get(entity.BankAccount, userId);
        current.Name = entity.Name;
        current.AccountType = entity.AccountType;
        current.Color = entity.Color;
        current.Icon = entity.Icon;
        current.Notes = entity.Notes;
        current.Active = entity.Active;

        using var tran = GetTransaction();
        bankAccountRepository.Update(current);
        tran.Complete();
        return true;
    }

    public bool DeleteAccount(long bankAccount, long userId)
    {
        var current = Get(bankAccount, userId);
        current.Active = false;

        using var tran = GetTransaction();
        bankAccountRepository.Update(current);
        tran.Complete();
        return true;
    }

    public bool IncrementBalance(long bankAccount, decimal delta, long userId)
    {
        EnsureOwnership(bankAccount, userId);
        return bankAccountRepository.IncrementBalance(bankAccount, delta, userId);
    }
}
