using Dapper;
using Finnance.Api.Modules.AuditLog.Domain.Entities;
using Finnance.Api.Modules.AuditLog.Domain.Interfaces;
using Finnance.Api.Modules.AuditLog.Repository.Models;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.AuditLog.Repository.Repositories;

public class AuditLogRepository : BaseRepository<AuditLogEntity, AuditLogMod>, IAuditLogRepository
{
    public List<AuditLogEntity> Search(long auditLog = 0,
                                       long changedBy = 0,
                                       string tableName = null,
                                       long record = 0,
                                       long auditAction = 0,
                                       int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM audit_log WHERE 1 = 1 ");

        if (auditLog > 0)
        {
            param.Add("auditLog", auditLog);
            sb.Append("AND audit_log = @auditLog ");
        }

        if (changedBy > 0)
        {
            param.Add("changedBy", changedBy);
            sb.Append("AND changed_by = @changedBy ");
        }

        if (tableName.IsNotEmpty())
        {
            param.Add("tableName", tableName);
            sb.Append("AND table_name = @tableName ");
        }

        if (record > 0)
        {
            param.Add("record", record);
            sb.Append("AND record = @record ");
        }

        if (auditAction > 0)
        {
            param.Add("auditAction", auditAction);
            sb.Append("AND audit_action = @auditAction ");
        }

        sb.Append("ORDER BY created DESC ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<AuditLogMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
