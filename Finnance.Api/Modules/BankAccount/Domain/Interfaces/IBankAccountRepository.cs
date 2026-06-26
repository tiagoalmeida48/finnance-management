using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Modules.BankAccount.Domain.Entities;

namespace Finnance.Api.Modules.BankAccount.Domain.Interfaces;

public interface IBankAccountRepository : IBaseRepository<BankAccountEntity>
{
    List<BankAccountEntity> Search(long user = 0,
                                   long bankAccount = 0,
                                   long accountType = 0,
                                   bool active = false,
                                   int quantity = 0);

    bool IncrementBalance(long bankAccount, decimal delta, long user);

    int ReconcileBalances(long user);
}
