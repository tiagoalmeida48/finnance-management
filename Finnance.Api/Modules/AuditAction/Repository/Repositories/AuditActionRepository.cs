using Dapper;
using Finnance.Api.Modules.AuditAction.Domain.Entities;
using Finnance.Api.Modules.AuditAction.Domain.Interfaces;
using Finnance.Api.Modules.AuditAction.Repository.Models;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.AuditAction.Repository.Repositories;

public class AuditActionRepository : BaseRepository<AuditActionEntity, AuditActionMod>, IAuditActionRepository
{
    public List<AuditActionEntity> Search(long auditAction = 0,
                                          string name = null,
                                          bool active = false,
                                          int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM audit_action WHERE 1 = 1 ");

        if (auditAction > 0)
        {
            param.Add("auditAction", auditAction);
            sb.Append("AND audit_action = @auditAction ");
        }

        if (name.IsNotEmpty())
        {
            param.Add("name", name);
            sb.Append("AND name = @name ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<AuditActionMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
