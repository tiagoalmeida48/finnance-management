using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.SystemConfig.Domain.Entities;

public class SystemConfigEntity : BaseEntity
{
    public long SystemConfig { get; set; }

    public string Key { get; set; }

    public decimal Value { get; set; }

    public bool Active { get; set; }
}
