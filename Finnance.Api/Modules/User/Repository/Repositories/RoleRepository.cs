using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class RoleRepository : BaseRepository<RoleEntity, RoleMod>, IRoleRepository
{
    public RoleEntity GetByCode(string code)
    {
        const string sql = "SELECT * FROM \"role\" WHERE code = @code AND active LIMIT 1";
        using var con = Conn;
        var model = con.QueryFirstOrDefault<RoleMod>(sql, new { code });
        return MapToEntity(model);
    }
}
