using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class UserRepository : BaseRepository<UserEntity, UserMod>, IUserRepository
{
    public UserEntity GetByEmail(string email)
    {
        const string sql = "SELECT * FROM \"user\" WHERE LOWER(email) = LOWER(@email) AND active LIMIT 1";
        using var con = Conn;
        var model = con.QueryFirstOrDefault<UserMod>(sql, new { email });
        return MapToEntity(model);
    }

    public bool ExistEmail(string email, long ignoreUser)
    {
        const string sql = "SELECT COUNT(1) FROM \"user\" WHERE LOWER(email) = LOWER(@email) AND \"user\" <> @ignoreUser";
        using var con = Conn;
        return con.ExecuteScalar<long>(sql, new { email, ignoreUser }) > 0;
    }

    public bool UpdatePassword(long user, string passwordHash)
    {
        const string sql = "UPDATE \"user\" SET password_hash = @passwordHash, updated = @now WHERE \"user\" = @user";
        using var con = Conn;
        return con.Execute(sql, new { user, passwordHash, now = DateTime.Now }) > 0;
    }

    public bool DeleteUser(long user)
    {
        const string sql = "DELETE FROM \"user\" WHERE \"user\" = @user";
        using var con = Conn;
        return con.Execute(sql, new { user }) > 0;
    }
}
