using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class UserRoleRepository : BaseRepository<UserRoleEntity, UserRoleMod>, IUserRoleRepository
{
    public IEnumerable<string> GetRoleCodesByUser(long user)
    {
        const string sql = @"SELECT r.code FROM user_role ur
                             JOIN ""role"" r ON r.""role"" = ur.""role""
                             WHERE ur.""user"" = @user AND ur.active AND r.active";
        using var con = Conn;
        return con.Query<string>(sql, new { user });
    }

    public bool ExistUserRole(long user, long role)
    {
        const string sql = "SELECT COUNT(1) FROM user_role WHERE \"user\" = @user AND \"role\" = @role";
        using var con = Conn;
        return con.ExecuteScalar<long>(sql, new { user, role }) > 0;
    }

    public bool DeleteByUser(long user)
    {
        const string sql = "DELETE FROM user_role WHERE \"user\" = @user";
        using var con = Conn;
        return con.Execute(sql, new { user }) > 0;
    }
}
