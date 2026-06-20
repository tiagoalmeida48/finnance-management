using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class RoleRepository : BaseRepository<RoleEntity, RoleMod>, IRoleRepository
{
    public List<RoleEntity> Search(long role = 0,
                                   string name = null,
                                   bool active = false,
                                   int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("""SELECT * FROM "role" WHERE 1 = 1 """);

        if (role > 0)
        {
            param.Add("role", role);
            sb.Append("""AND "role" = @role """);
        }

        if (name.IsNotEmpty())
        {
            param.Add("name", name);
            sb.Append("AND name = @name ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<RoleMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
