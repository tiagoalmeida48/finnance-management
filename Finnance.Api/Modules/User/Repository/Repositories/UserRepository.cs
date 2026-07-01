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

    public UserEntity SearchByToken(string column, string token)
    {
        var sql = $"""SELECT * FROM "user" WHERE {column} = @token LIMIT 1""";

        using var con = Conn;
        var model = con.Query<UserMod>(sql, new { token }).FirstOrDefault();
        return model == null ? null : MapToEntity(model);
    }

    public string ExportData(long user)
    {
        const string sql = """
            SELECT json_build_object(
              'user', (SELECT to_jsonb(u) - 'password_hash' - 'verify_token' - 'reset_token' FROM "user" u WHERE u."user" = @user),
              'bank_accounts', (SELECT COALESCE(json_agg(a), '[]'::json) FROM bank_account a WHERE a."user" = @user),
              'credit_cards', (SELECT COALESCE(json_agg(c), '[]'::json) FROM credit_card c WHERE c."user" = @user),
              'categories', (SELECT COALESCE(json_agg(c), '[]'::json) FROM category c WHERE c."user" = @user),
              'transactions', (SELECT COALESCE(json_agg(t), '[]'::json) FROM "transaction" t WHERE t."user" = @user),
              'credit_card_invoices', (SELECT COALESCE(json_agg(i), '[]'::json) FROM credit_card_invoice i WHERE i."user" = @user),
              'salary_settings', (SELECT COALESCE(json_agg(s), '[]'::json) FROM settings_salary s WHERE s."user" = @user)
            )::text
            """;

        using var con = Conn;
        return con.ExecuteScalar<string>(sql, new { user });
    }
}
