using Npgsql;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api;

public static partial class Configuration
{
    public static void SeedConfiguration(this IConfiguration configuration)
    {
        var strCon = configuration.GetConnectionString("DefaultConnection");
        var connStr = HashHelper.DecryptConnectionString(strCon);

        using var con = new NpgsqlConnection(connStr);
        con.Open();

        SeedRoles(con);
        SeedLookup(con, "transaction_type", ["Receita", "Despesa", "Transferência"]);
        SeedLookup(con, "account_type", ["Conta Corrente", "Poupança", "Carteira", "Investimento", "Outro"]);
        SeedLookup(con, "category_type", ["Receita", "Despesa"]);
        SeedLookup(con, "payment_method", ["Dinheiro", "Débito", "Crédito", "PIX", "Transferência", "Outro"]);
        SeedLookup(con, "invoice_status", ["Aberta", "Parcial", "Paga"]);
        SeedLookup(con, "audit_action", ["INSERT", "UPDATE", "DELETE"]);
        SeedSystemConfig(con, Constants.SystemConfigKey.TetoInss, Constants.DefaultTetoInss);
    }

    private static void SeedRoles(NpgsqlConnection con)
    {
        SeedNamedRow(con, "\"role\"", "\"role\"", Constants.RoleId.ADMIN, "Administrador");
        SeedNamedRow(con, "\"role\"", "\"role\"", Constants.RoleId.USER, "Usuário");
    }

    private static void SeedLookup(NpgsqlConnection con, string table, string[] names)
    {
        for (var i = 0; i < names.Length; i++)
            SeedNamedRow(con, table, table, i + 1, names[i]);
    }

    private static void SeedNamedRow(NpgsqlConnection con, string table, string pkColumn, long id, string name)
    {
        const string sqlTemplate =
            "INSERT INTO {0} ({1}, name, active, created, updated) " +
            "OVERRIDING SYSTEM VALUE " +
            "SELECT @id, @name, TRUE, now(), now() " +
            "WHERE NOT EXISTS (SELECT 1 FROM {0} WHERE {1} = @id)";

        var sql = string.Format(sqlTemplate, table, pkColumn);

        using var cmd = new NpgsqlCommand(sql, con);
        cmd.Parameters.AddWithValue("id", id);
        cmd.Parameters.AddWithValue("name", name);
        cmd.ExecuteNonQuery();
    }

    private static void SeedSystemConfig(NpgsqlConnection con, string key, decimal value)
    {
        const string sql =
            "INSERT INTO system_config (key, value, active, created, updated) " +
            "SELECT @key, @value, TRUE, now(), now() " +
            "WHERE NOT EXISTS (SELECT 1 FROM system_config WHERE key = @key)";

        using var cmd = new NpgsqlCommand(sql, con);
        cmd.Parameters.AddWithValue("key", key);
        cmd.Parameters.AddWithValue("value", value);
        cmd.ExecuteNonQuery();
    }
}
