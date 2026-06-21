using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.AccountType.Domain.Entities;

public class AccountTypeEntity : BaseEntity
{
    public long AccountType { get; set; }

    public string Name { get; set; }

    public bool Active { get; set; }
}
