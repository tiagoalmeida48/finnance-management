using Finnance.Api.Modules.Common.Application.Interfaces;
using Finnance.Api.Modules.BankAccount.Domain.Entities;

namespace Finnance.Api.Modules.BankAccount.Application.Interfaces;

public interface IBankAccountService : IBaseService<BankAccountEntity>
{
    BankAccountEntity Get(long bankAccount, long userId);
    List<BankAccountEntity> List(long userId);
    long CreateAccount(BankAccountEntity entity, long userId);
    bool UpdateAccount(BankAccountEntity entity, long userId);
    bool DeleteAccount(long bankAccount, long userId);
    bool IncrementBalance(long bankAccount, decimal delta, long userId);
    int ReconcileBalances(long userId);
}
