using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.TransactionType.Domain.Entities;

public class TransactionTypeEntity : BaseEntity
{
    public long TransactionType { get; set; }

    public string Name { get; set; }

    public bool Active { get; set; }
}
