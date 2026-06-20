using Dapper;
using Finnance.Api.Shared.BaseClass;
using System.Reflection;

namespace Finnance.Api.Modules.Common.Repository;

public static class TypeMapper
{
    private const string ModulesRoot = "Finnance.Api.Modules";

    public static void Initialize(string[] layerSuffix, string[] excludes)
    {
        var assembly = Assembly.GetExecutingAssembly();

        var classes = from type in assembly.GetExportedTypes()
            where type.Namespace != null && type.IsClass
                  && type.Namespace.StartsWith(ModulesRoot)
                  && layerSuffix.Any(s => type.Namespace.EndsWith(s))
                  && !excludes.Any(e => type.Name.StartsWith(e))
            select type;

        foreach (var type in classes)
        {
            var mapper = (SqlMapper.ITypeMap)Activator.CreateInstance(typeof(ColumnAttributeTypeMapper<>).MakeGenericType(type));
            SqlMapper.SetTypeMap(type, mapper);
        }
    }
}

public class ColumnAttributeTypeMapper<T> : FallBackTypeMapper
{
    public ColumnAttributeTypeMapper() : base([
        new CustomPropertyTypeMap(typeof(T), (type, columnName) =>
                                      type.GetProperties().FirstOrDefault(prop =>
                                                                              prop.GetCustomAttributes(false)
                                                                                  .OfType<ColumnAttribute>()
                                                                                  .Any(attribute => string.Equals(attribute.Name, columnName, StringComparison.CurrentCultureIgnoreCase))
                                      )
        ),
        new DefaultTypeMap(typeof(T))
    ])
    {
    }
}

public class FallBackTypeMapper(IEnumerable<SqlMapper.ITypeMap> mappers) : SqlMapper.ITypeMap
{
    public ConstructorInfo FindConstructor(string[] names, Type[] types)
    {
        foreach (var mapper in mappers)
        {
            try
            {
                var result = mapper.FindConstructor(names, types);

                if (result != null)
                    return result;
            }
            catch (NotImplementedException)
            {
            }
        }
        return null;
    }

    public ConstructorInfo FindExplicitConstructor()
    {
        return mappers
            .Select(mapper => mapper.FindExplicitConstructor())
            .FirstOrDefault(result => result != null);
    }

    public SqlMapper.IMemberMap GetConstructorParameter(ConstructorInfo constructor, string columnName)
    {
        foreach (var mapper in mappers)
        {
            try
            {
                var result = mapper.GetConstructorParameter(constructor, columnName);

                if (result != null)
                    return result;
            }
            catch (NotImplementedException)
            {
            }
        }
        return null;
    }

    public SqlMapper.IMemberMap GetMember(string columnName)
    {
        foreach (var mapper in mappers)
        {
            try
            {
                var result = mapper.GetMember(columnName);

                if (result != null)
                    return result;
            }
            catch (NotImplementedException)
            {
            }
        }
        return null;
    }
}
