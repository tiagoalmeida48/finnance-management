using Finnance.Api.Modules.BankAccount.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.BankAccount.Application.Services;

public partial class BankAccountService
{
    public BankAccountEntity Get(long bankAccount, long userId)
    {
        var current = bankAccountRepository.Search(bankAccount: bankAccount, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.AccountNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);

        return current;
    }

    public List<BankAccountEntity> List(long userId, bool includeInactive = false)
    {
        return bankAccountRepository.Search(user: userId, active: !includeInactive);
    }
}
