using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    private void ApplyBalance(TransactionEntity tx, int sign)
    {
        if (!IsBalanceEligible(tx))
            return;

        var amount = tx.Amount ?? 0;
        var account = tx.Account.Value;

        if (tx.TransactionType == Constants.TransactionTypeId.INCOME)
        {
            bankAccountService.IncrementBalance(account, sign * amount, tx.User);
        }
        else if (tx.TransactionType == Constants.TransactionTypeId.EXPENSE)
        {
            bankAccountService.IncrementBalance(account, sign * -amount, tx.User);
        }
        else if (tx.TransactionType == Constants.TransactionTypeId.TRANSFER)
        {
            bankAccountService.IncrementBalance(account, sign * -amount, tx.User);

            if (tx.ToAccount is > 0)
                bankAccountService.IncrementBalance(tx.ToAccount.Value, sign * amount, tx.User);
        }
    }

    private static bool IsBalanceEligible(TransactionEntity tx)
    {
        return tx.Paid && (tx.Card is null or <= 0) && tx.Account is > 0;
    }
}
