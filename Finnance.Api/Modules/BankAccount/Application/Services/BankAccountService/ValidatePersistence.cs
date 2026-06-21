using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.BankAccount.Application.Services;

public partial class BankAccountService
{
    private void EnsureOwnership(long bankAccount, long userId)
    {
        var current = bankAccountRepository.Search(bankAccount: bankAccount, quantity: 1).FirstOrDefault();
        if (current == null)
            throw new ApplicationException(Constants.ErrorMessage.AccountNotFound);

        if (current.User != userId)
            throw new ApplicationException(Constants.ErrorMessage.AccessDeniedResource);
    }
}
