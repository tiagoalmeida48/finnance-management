using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class UserRoleRepository : BaseRepository<UserRoleEntity, UserRoleMod>, IUserRoleRepository
{
    public List<UserRoleEntity> Search(long user = 0,
                                       long role = 0,
                                       bool active = false,
                                       int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM user_role WHERE 1 = 1 ");

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }

        if (role > 0)
        {
            param.Add("role", role);
            sb.Append("""AND "role" = @role """);
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<UserRoleMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }

    public List<long> SearchRoleIds(long user)
    {
        const string query = """SELECT "role" FROM user_role WHERE "user" = @user AND active""";

        using var con = Conn;
        return con.Query<long>(query, new { user }).ToList();
    }

    public List<(long User, bool IsAdmin)> SearchAdminFlags(long adminRole)
    {
        const string query = """
                             SELECT u."user",
                                    BOOL_OR(ur."role" = @adminRole AND ur.active) AS isadmin
                             FROM "user" u
                             LEFT JOIN user_role ur ON ur."user" = u."user"
                             GROUP BY u."user"
                             """;

        using var con = Conn;
        return con.Query<(long User, bool IsAdmin)>(query, new { adminRole }).ToList();
    }
}
