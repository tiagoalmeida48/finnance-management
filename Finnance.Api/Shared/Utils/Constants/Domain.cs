namespace Finnance.Api.Shared.Utils;

public static partial class Constants
{
    public static class TransactionTypeId
    {
        public const long INCOME = 1;
        public const long EXPENSE = 2;
        public const long TRANSFER = 3;
    }

    public static class AccountTypeId
    {
        public const long CHECKING = 1;
        public const long SAVINGS = 2;
        public const long WALLET = 3;
        public const long INVESTMENT = 4;
        public const long OTHER = 5;
    }

    public static class CategoryTypeId
    {
        public const long INCOME = 1;
        public const long EXPENSE = 2;
    }

    public static class PaymentMethodId
    {
        public const long CASH = 1;
        public const long DEBIT = 2;
        public const long CREDIT = 3;
        public const long PIX = 4;
        public const long TRANSFER = 5;
        public const long OTHER = 6;
    }

    public static class InvoiceStatusId
    {
        public const long OPEN = 1;
        public const long PARTIAL = 2;
        public const long PAID = 3;
    }

    public static class AuditActionId
    {
        public const long INSERT = 1;
        public const long UPDATE = 2;
        public const long DELETE = 3;
    }

    public static class GroupType
    {
        public const string Installment = "installment";
        public const string Recurring = "recurring";
    }

    public static class SystemConfigKey
    {
        public const string TetoInss = "teto_inss";
    }

    public const decimal DefaultTetoInss = 1167.89m;

    public const string OpenCycleEndDate = "9999-12-31";
}
