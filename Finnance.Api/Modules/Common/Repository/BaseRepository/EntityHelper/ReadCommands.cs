using Dapper.Contrib.Extensions;
using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using System.Reflection;
using System.Text;

namespace Finnance.Api.Modules.Common.Repository;

public static partial class EntityHelper
{
    public static string GetLastKeySelect<T>(string schema) where T : BaseModel
    {
        var tb = GetTableName<T>(schema);
        var key = GetAutoKey<T>();
        if (key.IsEmpty())
            return string.Empty;

        var sel = $"SELECT MAX({key}) FROM {tb}";
        return sel;
    }

    public static string GetSelectFrom<T>(string schema) where T : BaseModel
    {
        return $"{GetSelect<T>()} {GetFrom<T>(schema)}";
    }

    public static string GetSelect<T>() where T : BaseModel
    {
        var select = new StringBuilder();
        var table = typeof(T);
        var columns = table.GetProperties();

        select.Append("SELECT ");

        foreach (var cp in columns)
        {
            var attrib = cp.GetCustomAttribute<ComputedAttribute>();
            if (attrib != null) continue;

            var realName = cp.GetColumnName();
            select.Append($"{realName}, ");
        }

        select.Remove(select.Length - 2, 2);

        return select.ToString();
    }

    public static string GetFrom<T>(string schema) where T : BaseModel
    {
        var select = new StringBuilder();
        var name = GetTableName<T>(schema);

        select.Append($"FROM {name} ");

        return select.ToString();
    }

    public static string GetTableName<T>(string schema) where T : BaseModel
    {
        var table = typeof(T);
        var name = table.Name;

        var attNome = table.GetCustomAttribute<TableAttribute>();
        if (attNome != null) name = attNome.Name;

        return $"{schema}{name}";
    }

    public static string GetSelectDates<T>(string schema) where T : BaseModel
    {
        var select = new StringBuilder();

        var table = GetTableName<T>(schema);
        select.Append($"SELECT CREATED, UPDATED FROM {table} ");
        select.Append(GetWhereByKey<T>());

        return select.ToString();
    }

    public static object GetValueFromField<T>(this T mod, string fieldName)
    {
        if (mod == null) return null;

        var type = typeof(T);
        var props = type.GetProperties();

        foreach (var item in props)
        {
            var name = GetColumnName(item);
            if (name.Equals(fieldName, StringComparison.InvariantCultureIgnoreCase))
                return item.GetValue(mod);
        }

        return null;
    }
}