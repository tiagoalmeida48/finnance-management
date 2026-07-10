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

        SeedLookup(con, "transaction_type", ["Receita", "Despesa", "Transferência"]);
        SeedLookup(con, "account_type", ["Conta Corrente", "Poupança", "Investimento", "Carteira", "Outro"]);
        SeedLookup(con, "category_type", ["Receita", "Despesa"]);
        SeedLookup(con, "payment_method", ["Crédito", "Débito", "PIX", "Dinheiro", "Pagamento de boleto", "Transferência", "Outro"]);
        SeedLookup(con, "invoice_status", ["Aberta", "Fechada", "Parcial", "Paga", "Vencida"]);
        SeedLookup(con, "audit_action", ["Inserção", "Alteração", "Exclusão", "Erro"]);
        SeedLookup(con, "subscription_status", ["Ativa", "Atrasada", "Cancelada", "Reembolsada", "Chargeback"]);
        SeedSystemConfig(con, Constants.SystemConfigKey.TetoInss, Constants.DefaultTetoInss);
        SeedAdminUser(con, "admin@finnance.com", "admin123", "Administrador");
    }

    private static void SeedAdminUser(NpgsqlConnection con, string email, string password, string fullName)
    {
        const string sql =
            "INSERT INTO \"user\" (email, password_hash, full_name, currency, locale, active, is_admin, email_verified, created, updated) " +
            "SELECT @email, @hash, @fullName, 'BRL', 'pt-BR', TRUE, TRUE, TRUE, now(), now() " +
            "WHERE NOT EXISTS (SELECT 1 FROM \"user\" WHERE email = @email)";

        using var cmd = new NpgsqlCommand(sql, con);
        cmd.Parameters.AddWithValue("email", email);
        cmd.Parameters.AddWithValue("hash", Argon2Helper.GenerateHashPassword(password));
        cmd.Parameters.AddWithValue("fullName", fullName);
        cmd.ExecuteNonQuery();
    }

    private static void SeedLookup(NpgsqlConnection con, string table, string[] names)
    {
        for (var i = 0; i < names.Length; i++)
            SeedNamedRow(con, table, table, i + 1, names[i]);

        AdvanceSequence(con, table, table);
    }

    private static void SeedNamedRow(NpgsqlConnection con, string table, string pkColumn, long id, string name)
    {
        const string sqlTemplate =
            "INSERT INTO {0} ({1}, name, active, created, updated) " +
            "OVERRIDING SYSTEM VALUE " +
            "VALUES (@id, @name, TRUE, now(), now()) " +
            "ON CONFLICT ({1}) DO UPDATE SET name = EXCLUDED.name, active = TRUE, updated = now()";

        var sql = string.Format(sqlTemplate, table, pkColumn);

        using var cmd = new NpgsqlCommand(sql, con);
        cmd.Parameters.AddWithValue("id", id);
        cmd.Parameters.AddWithValue("name", name);
        cmd.ExecuteNonQuery();
    }

    private static void AdvanceSequence(NpgsqlConnection con, string table, string pkColumn)
    {
        const string sqlTemplate =
            "SELECT setval(pg_get_serial_sequence('{0}', '{1}'), GREATEST((SELECT COALESCE(MAX({1}), 1) FROM {0}), 1))";

        var sql = string.Format(sqlTemplate, table, pkColumn);

        using var cmd = new NpgsqlCommand(sql, con);
        cmd.ExecuteScalar();
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
