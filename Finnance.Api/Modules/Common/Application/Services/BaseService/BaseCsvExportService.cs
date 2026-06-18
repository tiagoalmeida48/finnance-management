using Finnance.Api.Shared;
using System.Reflection;
using System.Text;
using ColumnAttribute = System.ComponentModel.DataAnnotations.Schema.ColumnAttribute;

namespace Finnance.Api.Modules.Common.Application.Services;

public abstract partial class BaseService<T>
{
    protected IEnumerable<string> ColumnsDescriptionHelperCsv<Y>(List<string> newColumns = null)
    {
        var columns = new List<string>();
        var props = typeof(Y).GetProperties();

        if (newColumns.IsEmpty()) return columns;

        foreach (var column in newColumns)
        {
            var prop = props.FirstOrDefault(x => x.Name == column);
            if (prop == null) continue;

            var propAttr = prop.GetCustomAttribute<ColumnAttribute>();

            if (propAttr.Name.IsNotEmpty())
                columns.Add(propAttr.Name);
            else
                columns.Add(prop.Name.ToLower());
        }

        return columns;
    }

    public string ColumnsHelperCsv<Z>(IEnumerable<Z> registers, IEnumerable<string> translatedNameColumns = null, List<string> newColumns = null)
    {
        var props = typeof(Z).GetProperties();
        var sb = new StringBuilder();
        var nameColumns = new List<string>();
        var propsWithAttr = new List<PropertyInfo>();

        var newProps = new List<PropertyInfo>();
        if (newColumns.IsNotEmpty())
        {
            foreach (var column in newColumns)
            {
                var prop = props.FirstOrDefault(x => x.Name == column);
                newProps.Add(prop);
            }

            foreach (var prop in newProps)
            {
                var propAttr = prop.GetCustomAttribute<ColumnAttribute>();
                if (propAttr == null) continue;

                nameColumns.Add(prop.Name);
                propsWithAttr.Add(prop);
            }
        }
        else
        {
            foreach (var prop in props)
            {
                var propAttr = prop.GetCustomAttribute<ColumnAttribute>();
                if (propAttr == null) continue;

                nameColumns.Add(prop.Name);
                propsWithAttr.Add(prop);
            }
        }

        sb.AppendLine(string.Join(";", translatedNameColumns ?? nameColumns));
        foreach (var register in registers)
        {
            var values = propsWithAttr.Select(prop =>
            {
                var value = prop.GetValue(register);

                if (value is bool boolValue)
                    return boolValue ? "1" : "0";

                if (value is DateTime datetimeValue)
                    return datetimeValue.ToString("dd/MM/yyyy HH:mm:ss");

                return value?.ToString();
            }).ToList();
            sb.AppendLine(string.Join(";", values));
        }

        return sb.ToString();
    }
}