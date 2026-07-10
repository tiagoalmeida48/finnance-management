using Dapper;
using Dapper.Contrib.Extensions;
using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using System.Reflection;
using System.Text;

namespace Finnance.Api.Modules.Common.Repository;

public static partial class EntityHelper
{
    public static (StringBuilder inserts, DynamicParameters parameters) GenerateInserts<T>(this IEnumerable<T> dataList, string schema) where T : BaseModel
    {
        var inserts = new StringBuilder();
        var parametersList = new DynamicParameters();

        if (dataList.IsEmpty())
            return (inserts, parametersList);

        var type = typeof(T);
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var tbName = GetTableName<T>(schema);

        foreach (var data in dataList)
        {
            var columnNames = new StringBuilder();
            var parameterNames = new StringBuilder();

            for (var i = 0; i < properties.Length; i++)
            {
                var columnAttr = properties[i].GetCustomAttribute<ColumnAttribute>();
                var isMapped = properties[i].GetCustomAttribute<ComputedAttribute>() == null;
                var isKey = properties[i].GetCustomAttribute<KeyAttribute>() != null;

                if (!isMapped || isKey) continue;

                var propName = GetColumnName(properties[i]);
                var paramName = $"@{propName.Replace("\"", "")}_{Guid.NewGuid():N}";

                if (propName is "Created" or "Updated") continue;

                columnNames.Append($"{propName}");
                parameterNames.Append($"{paramName}{(columnAttr != null && columnAttr.IsJsonColumn ? "::jsonb" : string.Empty)}, ");

                if (i < properties.Length - 1)
                {
                    columnNames.Append(", ");
                    parameterNames.Append(", ");
                }
                parametersList.Add(paramName, properties[i].GetValue(data));
            }
            var insertCommand = $"INSERT INTO {tbName} ({columnNames.Remove(columnNames.Length - 2, 2)}) VALUES ({parameterNames.Remove(parameterNames.Length - 2, 2)});";
            inserts.Append(insertCommand);
        }

        return (inserts, parametersList);
    }

    public static (StringBuilder updates, DynamicParameters parameters) GenerateUpdates<T>(this IEnumerable<T> dataList,
                                                                                            string schema,
                                                                                            long? tenant = null) where T : BaseModel
    {
        var updates = new StringBuilder();
        var parametersList = new DynamicParameters();

        if (dataList.IsEmpty())
            return (updates, parametersList);

        var type = typeof(T);
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var tbName = GetTableName<T>(schema);

        foreach (var data in dataList)
        {
            var setClause = new StringBuilder();
            var whereClause = new StringBuilder();

            foreach (var property in properties)
            {
                var columnAttr = property.GetCustomAttribute<ColumnAttribute>();
                var isMapped = property.GetCustomAttribute<ComputedAttribute>() == null;
                var isKey = property.GetCustomAttribute<KeyAttribute>() != null || property.GetCustomAttribute<ExplicitKeyAttribute>() != null;

                if (!isMapped) continue;

                var propName = GetColumnName(property);
                if (propName != "Created")
                {
                    var paramName = $"@{propName.Replace("\"", "")}_{Guid.NewGuid():N}";
                    setClause.Append($"{propName} = {paramName}{(columnAttr != null && columnAttr.IsJsonColumn ? "::jsonb" : string.Empty)}, ");

                    parametersList.Add(paramName, propName == "Updated" ? DateTime.Now : property.GetValue(data));
                }

                if (!isKey) continue;

                var paramNameWhere = $"@{propName.Replace("\"", "")}_key_{Guid.NewGuid():N}";
                whereClause.Append($"{propName} = {paramNameWhere} AND ");
                parametersList.Add(paramNameWhere, property.GetValue(data));
            }

            if (setClause.Length == 0 || whereClause.Length == 0)
                continue;

            if (tenant.HasValue)
            {
                var tenantParam = $"@tenant_{Guid.NewGuid():N}";
                whereClause.Append($"\"user\" = {tenantParam} AND ");
                parametersList.Add(tenantParam, tenant.Value);
            }

            var updateCommand = $"UPDATE {tbName} SET {setClause.Remove(setClause.Length - 2, 2)} WHERE {whereClause.Remove(whereClause.Length - 5, 5)};";
            updates.Append(updateCommand);
        }

        return (updates, parametersList);
    }

    public static (StringBuilder deletes, DynamicParameters parameters) GenerateDeletes<T>(this IEnumerable<T> dataList,
                                                                                            string schema,
                                                                                            long? tenant = null) where T : BaseModel
    {
        var deletes = new StringBuilder();
        var parametersList = new DynamicParameters();

        if (dataList == null || !dataList.Any())
            return (deletes, parametersList);

        var type = typeof(T);
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var tbName = GetTableName<T>(schema);

        foreach (var data in dataList)
        {
            var whereClause = new StringBuilder();
            foreach (var property in properties)
            {
                var isKey = property.GetCustomAttribute<KeyAttribute>() != null || property.GetCustomAttributes<ExplicitKeyAttribute>().IsNotEmpty();
                if (!isKey) continue;

                var propName = GetColumnName(property);
                var paramName = $"@{propName.Replace("\"", "")}_del_{Guid.NewGuid():N}";
                whereClause.Append($"{propName} = {paramName} AND ");
                parametersList.Add(paramName, property.GetValue(data));
            }

            if (whereClause.Length == 0) continue;

            if (tenant.HasValue)
            {
                var tenantParam = $"@tenant_{Guid.NewGuid():N}";
                whereClause.Append($"\"user\" = {tenantParam} AND ");
                parametersList.Add(tenantParam, tenant.Value);
            }

            var deleteCommand = $"DELETE FROM {tbName} WHERE {whereClause.Remove(whereClause.Length - 5, 5)};";
            deletes.Append(deleteCommand);
        }

        return (deletes, parametersList);
    }
}
