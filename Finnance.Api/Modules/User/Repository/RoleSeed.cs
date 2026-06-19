using Dapper;
using Npgsql;

namespace Finnance.Api.Modules.User.Repository;

public static class RoleSeed
{
    public static void Run(string connectionString)
    {
        const string sql = @"
            INSERT INTO ""role"" (code, name, active, created, updated) VALUES
                ('ADMIN', 'Administrador', true, now(), now()),
                ('USER',  'Usuário',       true, now(), now())
            ON CONFLICT (code) DO NOTHING;";
        using var con = new NpgsqlConnection(connectionString);
        con.Execute(sql);
    }
}
