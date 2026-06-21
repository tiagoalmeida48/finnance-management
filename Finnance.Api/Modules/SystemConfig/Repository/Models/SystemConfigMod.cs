using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.BaseClass;

namespace Finnance.Api.Modules.SystemConfig.Repository.Models;

[Table("system_config")]
public class SystemConfigMod : BaseModel
{
    [Key]
    [Column("system_config")]
    public long SystemConfig { get; set; }

    [Column("\"key\"")]
    public string Key { get; set; }

    [Column("value")]
    public decimal Value { get; set; }

    [Column("active")]
    public bool Active { get; set; }
}
