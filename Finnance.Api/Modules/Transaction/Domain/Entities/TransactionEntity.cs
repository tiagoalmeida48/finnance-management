using Finnance.Api.Modules.Common.Domain.Interfaces;
using Finnance.Api.Shared.Utils;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Transaction.Domain.Entities;

public class TransactionEntity : BaseEntity, IUserOwned
{
    public long Transaction { get; set; }

    public long User { get; set; }

    public long TransactionType { get; set; }

    public long? PaymentMethod { get; set; }

    public decimal? Amount { get; set; }

    public DateTime? PaymentDate { get; set; }

    public DateTime? PurchaseDate { get; set; }

    public string Description { get; set; }

    public long? Account { get; set; }

    public long? ToAccount { get; set; }

    public long? Card { get; set; }

    public long? Category { get; set; }

    public long? Invoice { get; set; }

    public long? InstallmentGroup { get; set; }

    public int? InstallmentNumber { get; set; }

    public long? RecurringGroup { get; set; }

    public long? RecurringRule { get; set; }

    public bool Fixed { get; set; }

    public bool Paid { get; set; }

    public string Notes { get; set; }

    public bool Active { get; set; }

    public override void ValidateCreate()
    {
        Active = true;

        ValidateCore();
    }

    public override void ValidateUpdate()
    {
        if (Transaction <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        ValidateCore();
    }

    private void ValidateCore()
    {
        if (Amount is null or <= 0)
            throw new ApplicationException(Constants.ErrorMessage.InvalidAmount);

        if (TransactionType != Constants.TransactionTypeId.INCOME
            && TransactionType != Constants.TransactionTypeId.EXPENSE
            && TransactionType != Constants.TransactionTypeId.TRANSFER)
            throw new ApplicationException(Constants.ErrorMessage.InvalidTransactionType);

        var isTransfer = TransactionType == Constants.TransactionTypeId.TRANSFER;

        if (ToAccount is > 0 && !isTransfer)
            throw new ApplicationException(Constants.ErrorMessage.ToAccountOnlyForTransfer);

        if (isTransfer && ToAccount is null or <= 0)
            throw new ApplicationException(Constants.ErrorMessage.ToAccountRequiredForTransfer);

        if (Card is > 0 && (Account is null or <= 0))
            throw new ApplicationException(Constants.ErrorMessage.AccountRequiredForCard);
    }
}
