using Finnance.Api.Modules.Transaction.Application.Dto;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Transaction.Application.Services;

public partial class TransactionService
{
    private void ValidateCreateInput(TransactionCreateDto input, long userId)
    {
        if (input.Amount <= 0)
            throw new ApplicationException(Constants.ErrorMessage.InvalidAmount);

        if (input.TransactionType != Constants.TransactionTypeId.INCOME
            && input.TransactionType != Constants.TransactionTypeId.EXPENSE
            && input.TransactionType != Constants.TransactionTypeId.TRANSFER)
            throw new ApplicationException(Constants.ErrorMessage.InvalidTransactionType);

        var isTransfer = input.TransactionType == Constants.TransactionTypeId.TRANSFER;

        if (input.ToAccount is > 0 && !isTransfer)
            throw new ApplicationException(Constants.ErrorMessage.ToAccountOnlyForTransfer);

        if (isTransfer && (input.ToAccount is null or <= 0))
            throw new ApplicationException(Constants.ErrorMessage.ToAccountRequiredForTransfer);

        if (input.Card is > 0 && (input.Account is null or <= 0))
            throw new ApplicationException(Constants.ErrorMessage.AccountRequiredForCard);

        EnsureAccountOwnership(input.Account, userId);
        EnsureAccountOwnership(input.ToAccount, userId);
        EnsureCardOwnership(input.Card, userId);
        EnsureCategoryOwnership(input.Category, userId);
    }

    private void EnsureAccountOwnership(long? account, long userId)
    {
        if (account is > 0)
            bankAccountService.Get(account.Value, userId);
    }

    private void EnsureAccountOwnership(long account, long userId)
    {
        if (account > 0)
            bankAccountService.Get(account, userId);
    }

    private void EnsureCardOwnership(long? card, long userId)
    {
        if (card is > 0)
            creditCardService.EnsureOwnership(card.Value, userId);
    }

    private void EnsureCategoryOwnership(long? category, long userId)
    {
        if (category is > 0)
            categoryService.Get(category.Value, userId);
    }
}
