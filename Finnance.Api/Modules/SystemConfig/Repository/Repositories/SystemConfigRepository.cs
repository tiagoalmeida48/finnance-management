using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.SystemConfig.Domain.Entities;
using Finnance.Api.Modules.SystemConfig.Domain.Interfaces;
using Finnance.Api.Modules.SystemConfig.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.SystemConfig.Repository.Repositories;

public class SystemConfigRepository : BaseRepository<SystemConfigEntity, SystemConfigMod>, ISystemConfigRepository
{
    public List<SystemConfigEntity> Search(long systemConfig = 0,
                                           string key = null,
                                           bool active = false,
                                           int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM system_config WHERE 1 = 1 ");

        if (systemConfig > 0)
        {
            param.Add("system_config", systemConfig);
            sb.Append("AND system_config = @system_config ");
        }

        if (key.IsNotEmpty())
        {
            param.Add("key", key);
            sb.Append("""AND "key" = @key """);
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<SystemConfigMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public SystemConfigEntity GetByKey(string key)
    {
        return Search(key: key, quantity: 1).FirstOrDefault();
    }
}
