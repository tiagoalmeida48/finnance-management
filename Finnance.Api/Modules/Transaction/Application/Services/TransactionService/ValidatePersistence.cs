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

        if (input.Card is > 0 && input.PaymentMethod != Constants.PaymentMethodId.CREDIT)
            throw new ApplicationException(Constants.ErrorMessage.CardRequiresCreditMethod);

        EnsureAccountOwnership(input.Account, userId);
        EnsureAccountOwnership(input.ToAccount, userId);
        EnsureCardBelongsToAccount(input.Card, input.Account, userId);
        EnsureCategoryOwnership(input.Category, userId);
    }

    private void EnsureCardBelongsToAccount(long? card, long? account, long userId)
    {
        if (card is not > 0)
            return;

        var entity = creditCardService.GetCard(card.Value, userId);

        if (account is > 0 && entity.BankAccount != account.Value)
            throw new ApplicationException(Constants.ErrorMessage.CardAccountMismatch);
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

    private void EnsureCategoryOwnership(long? category, long userId)
    {
        if (category is > 0)
            categoryService.Get(category.Value, userId);
    }
}
