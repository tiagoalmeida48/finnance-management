using Dapper;
using Finnance.Api.Modules.Transaction.Domain.Entities;
using Finnance.Api.Modules.Transaction.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.Transaction.Repository.Repositories;

public partial class TransactionRepository
{
    public List<TransactionEntity> GetForGrouping(long user, TransactionQuery query, bool sortAsc, string sortField)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        param.Add("user", user);
        sb.Append("""
            SELECT t.*,
                   (SELECT ig.total_installments FROM installment_group ig WHERE ig.installment_group = t.installment_group) AS total_installments
            FROM "transaction" t
            WHERE t."user" = @user AND t.active = TRUE
            """);
        sb.Append(' ');

        AppendReadFilters(sb, param, query);

        sb.Append($"ORDER BY {ResolveSortColumn(sortField)} {(sortAsc ? "ASC" : "DESC")} ");

        using var con = Conn;
        var model = con.Query<TransactionReadMod>(sb.ToString(), param).ToList();
        return model.Select(m => m.MapTo<TransactionEntity>()).ToList();
    }

    public List<TransactionEntity> GetByGroupIds(List<long> installmentGroups, List<long> recurringGroups, long user)
    {
        var param = new DynamicParameters();
        param.Add("user", user);
        param.Add("installmentGroups", installmentGroups ?? []);
        param.Add("recurringGroups", recurringGroups ?? []);

        const string sql = """
            SELECT t.*,
                   (SELECT ig.total_installments FROM installment_group ig WHERE ig.installment_group = t.installment_group) AS total_installments
            FROM "transaction" t
            WHERE t."user" = @user AND t.active = TRUE
              AND (t.installment_group = ANY(@installmentGroups) OR t.recurring_group = ANY(@recurringGroups))
            ORDER BY t.installment_number NULLS LAST, t.payment_date
            """;

        using var con = Conn;
        var model = con.Query<TransactionReadMod>(sql, param).ToList();
        return model.Select(m => m.MapTo<TransactionEntity>()).ToList();
    }
}
