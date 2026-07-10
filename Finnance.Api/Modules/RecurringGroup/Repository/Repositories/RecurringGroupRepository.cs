using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.RecurringGroup.Domain.Entities;
using Finnance.Api.Modules.RecurringGroup.Domain.Interfaces;
using Finnance.Api.Modules.RecurringGroup.Repository.Models;
using System.Text;

namespace Finnance.Api.Modules.RecurringGroup.Repository.Repositories;

public class RecurringGroupRepository : BaseRepository<RecurringGroupEntity, RecurringGroupMod>, IRecurringGroupRepository
{
    public List<RecurringGroupEntity> Search(long recurringGroup = 0,
                                             long user = 0,
                                             bool active = false,
                                             int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM recurring_group WHERE 1 = 1 ");
        sb.Append(GetTenantClause());
        TenantParams(param);

        if (recurringGroup > 0)
        {
            param.Add("recurringGroup", recurringGroup);
            sb.Append("AND recurring_group = @recurringGroup ");
        }

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<RecurringGroupMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
