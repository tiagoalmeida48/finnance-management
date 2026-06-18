using Dapper.Contrib.Extensions;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Shared.BaseClass;

public abstract class BaseModel
{
    [Computed]
    public string Language { get; set; }
    public DateTime Created { get; set; }
    public DateTime Updated { get; set; }
}

[AttributeUsage(AttributeTargets.Field | AttributeTargets.Property)]
public class ColumnAttribute(string name = null, FieldName fieldName = FieldName.NONE, bool exportCsv = false, bool isJsonColumn = false) : Attribute
{
    public string Name { get; set; } = name;
    public FieldName FieldName { get; set; } = fieldName;
    public bool ExportCsv { get; set; } = exportCsv;
    public bool IsJsonColumn { get; set; } = isJsonColumn;
}