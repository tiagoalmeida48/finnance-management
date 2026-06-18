using Dapper.Contrib.Extensions;
using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using System.Reflection;
using System.Text;

namespace Finnance.Api.Modules.Common.Repository;

public static partial class EntityHelper
{
    private static string GetAutoKey<T>() where T : BaseModel
    {
        var type = typeof(T);
        var props = type.GetProperties();
        var key = props.FirstOrDefault(p => p.GetCustomAttribute<KeyAttribute>() != null);

        return key != null ? key.GetColumnName() : string.Empty;
    }

    public static bool IsAutoKey<T>() where T : BaseModel
    {
        return GetAutoKey<T>().IsNotEmpty();
    }

    public static string GetInsertAutoKey<T>(string schema) where T : BaseModel
    {
        var insert = GetInsert<T>(schema);
        var autoKey = GetLastKeySelect<T>(schema);

        var insFinal = $"{insert};{autoKey};";

        return insFinal;
    }

    public static string GetWhereByKey<T>() where T : BaseModel
    {
        var select = new StringBuilder();

        select.Append("WHERE ");

        var type = typeof(T);

        var props = type.GetProperties();
        foreach (var cp in props)
        {
            var attrs = cp.GetCustomAttributes(true);
            foreach (var attr in attrs)
            {
                if (attr is not ExplicitKeyAttribute && attr is not KeyAttribute) continue;

                var colName = cp.GetColumnName();
                select.Append($" {colName} = {prefix}{cp.Name} AND");
            }
        }

        select.Remove(select.Length - 3, 3);
        return select.ToString();
    }

    public static string GetInsert<T>(string schema) where T : BaseModel
    {
        var select = new StringBuilder();
        var parameters = new StringBuilder();
        var table = typeof(T);
        var columns = table.GetProperties();
        var name = GetTableName<T>(schema);

        select.Append($"INSERT INTO {name} (");
        parameters.Append(" VALUES(");

        foreach (var cp in columns)
        {
            var columnAttr = cp.GetCustomAttribute<ColumnAttribute>();
            var attrib = cp.GetCustomAttribute<ComputedAttribute>();
            var isKey = cp.GetCustomAttribute<KeyAttribute>();

            if (attrib != null || isKey != null) continue;

            var colName = cp.GetColumnName();
            select.Append($"{colName}, ");

            parameters.Append($"{prefix}{cp.Name}{(columnAttr != null && columnAttr.IsJsonColumn ? "::jsonb" : string.Empty)}, ");
        }

        select.Remove(select.Length - 2, 2).Append(')');
        parameters.Remove(parameters.Length - 2, 2).Append(')');

        select.Append(parameters);

        return select.ToString();
    }

    public static string GetUpdate<T>(string schema) where T : BaseModel
    {
        var select = new StringBuilder();
        var table = typeof(T);
        var columns = table.GetProperties();
        var name = GetTableName<T>(schema);

        select.Append($"UPDATE {name} SET ");

        foreach (var cp in columns)
        {
            var columnAttr = cp.GetCustomAttribute<ColumnAttribute>();
            var isMapped = cp.GetCustomAttribute<ComputedAttribute>() == null;
            var isKey = cp.GetCustomAttribute<KeyAttribute>() != null;
            var expKey = cp.GetCustomAttribute<ExplicitKeyAttribute>() != null;
            if (!isMapped || isKey || expKey) continue;

            var colName = cp.GetColumnName();
            select.Append($"{colName} = {prefix}{cp.Name}{(columnAttr != null && columnAttr.IsJsonColumn ? "::jsonb" : string.Empty)}, ");
        }

        select.Remove(select.Length - 2, 2).Append(' ');
        var where = GetWhereByKey<T>();
        select.Append(where);

        return select.ToString();
    }

    public static string GetDelete<T>(string schema) where T : BaseModel
    {
        var select = new StringBuilder();
        var name = GetTableName<T>(schema);

        select.Append($"DELETE FROM {name} ");
        var where = GetWhereByKey<T>();
        select.Append(where);

        return select.ToString();
    }
}