using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Transaction.Repository.Models;

public class TransactionReadMod : TransactionMod
{
    [Column("total_installments")]
    public int? TotalInstallments { get; set; }
}
