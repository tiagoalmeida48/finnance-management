using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.Dashboard.Domain.Entities;

public class DashboardEntity : BaseEntity
{
    public long BankAccount { get; set; }

    public long User { get; set; }
}
