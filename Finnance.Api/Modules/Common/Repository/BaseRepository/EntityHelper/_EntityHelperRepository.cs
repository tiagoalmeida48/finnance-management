using Finnance.Api.Shared;
using Finnance.Api.Shared.BaseClass;
using Finnance.Api.Shared.Utils;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Finnance.Api.Modules.Common.Repository;

public static partial class EntityHelper
{
    private const string prefix = "@";

    private static string GetColumnName(this PropertyInfo col)
    {
        var realName = col.GetCustomAttribute<ColumnAttribute>();
        return realName == null ? col.Name : realName.Name;
    }

    public static Dictionary<string, string> GetDictionaryColumns<T>(IEnumerable<Ordination> propertyNames, string select) where T : class
    {
        var type = typeof(T);
        var dictionaryColumns = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        var selectClause = select.Split("FROM", StringSplitOptions.RemoveEmptyEntries)[0];
        selectClause = selectClause.Replace("SELECT", "", StringComparison.OrdinalIgnoreCase);

        var columnDefinitions = selectClause.Split([','], StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim()).ToList();

        var columnsWithAliases = new List<(string Column, string Alias)>();

        foreach (var columnDef in columnDefinitions)
        {
            var colDef = columnDef.Trim();

            const string columnAliasSplitPattern = @"\s+AS\s+|\s+(?=[^,\]]+$)";
            var parts = Regex.Split(colDef, columnAliasSplitPattern, RegexOptions.IgnoreCase);

            columnsWithAliases.Add((Column: parts[0], Alias: parts.Length == 1 ? null : parts[1]));
        }

        foreach (var propertyName in propertyNames)
        {
            var property = type.GetProperty(propertyName.ColumnName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if (property == null) continue;

            var columnAttribute = property.GetCustomAttribute<ColumnAttribute>();
            var propertyNameToMatch = columnAttribute?.Name ?? property.Name;

            var matchingColumn = columnsWithAliases.FirstOrDefault(c =>
                                                                       c.Alias != null && string.Equals(c.Alias, propertyNameToMatch, StringComparison.OrdinalIgnoreCase));

            if (matchingColumn.Column == null)
                matchingColumn = columnsWithAliases.FirstOrDefault(c => c.Alias == null && string.Equals(c.Column.NormalizeQueryColumnName(), propertyNameToMatch.NormalizeQueryColumnName(),
                                                                                                         StringComparison.OrdinalIgnoreCase));

            if (matchingColumn.Column != null)
                dictionaryColumns[property.Name] = matchingColumn.Column;
        }

        return dictionaryColumns;
    }

    public static string GetColumnsOrderBy<T>(this OrdinationParam ordination, string select) where T : BaseModel
    {
        var modelDictionary = GetDictionaryColumns<T>(ordination.Order, select);
        if (modelDictionary == null || modelDictionary.Count == 0)
            return null;

        var order = "ORDER BY ";
        foreach (var item in ordination.Order)
        {
            var valueColumn = modelDictionary.GetValueDictionary(item.ColumnName);
            if (valueColumn.IsEmpty()) continue;

            var ascOrDesc = item.Ascending ? "ASC" : "DESC";
            order += $"{valueColumn} {ascOrDesc} , ";
        }

        order = order.Remove(order.Length - 2, 2);
        return order;
    }
}