using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.User.Domain.Entities;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Modules.User.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.User.Repository.Repositories;

public class UserRepository : BaseRepository<UserEntity, UserMod>, IUserRepository
{
    public List<UserEntity> Search(long user = 0,
                                   string email = null,
                                   bool active = false,
                                   int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();
        
        sb.Append("""SELECT * FROM "user" WHERE 1 = 1 """);

        if (user > 0)
        {
            param.Add("user", user);
            sb.Append("""AND "user" = @user """);
        }
        
        if (email.IsNotEmpty())
        {
            param.Add("email", email);
            sb.Append("AND LOWER(email) = LOWER(@email) ");
        }
        
        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<UserMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
