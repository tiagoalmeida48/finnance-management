using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.AuditLog.Domain.Entities;

public class AuditLogEntity : BaseEntity
{
    public long AuditLog { get; set; }

    public long AuditAction { get; set; }

    public string TableName { get; set; }

    public long Record { get; set; }

    public string OldData { get; set; }

    public string NewData { get; set; }

    public long ChangedBy { get; set; }

    public string Description { get; set; }

    public override void ValidateCreate()
    {
        if (AuditAction <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (string.IsNullOrWhiteSpace(TableName))
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);

        if (Record <= 0)
            throw new ApplicationException(Constants.ErrorMessage.RequiredField);
    }
}
