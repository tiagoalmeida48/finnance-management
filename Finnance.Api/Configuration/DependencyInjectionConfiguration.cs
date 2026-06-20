using Finnance.Api.Shared;
using System.Reflection;

namespace Finnance.Api;

public static partial class Configuration
{
    public static void DependencyInjectionConfiguration(this IServiceCollection services)
    {
        var soulsDom = GetSouls([".Domain.Services"]);

        foreach (var (inter, impl) in soulsDom)
            services.AddTransient(inter, impl);

        var almasApp = GetSouls([".Application.Services"],
                                ["BaseService", "CsvExportService", "ADExtensionMethods"]
        );

        foreach (var (inter, impl) in almasApp)
            services.AddTransient(inter, impl);

        var almasRep = GetSouls([".Repository.Repositories"],
                                [
                                    "BaseRepository", "TypeMapper", "ColumnAttributeTypeMapper",
                                    "EntityHelper", "FallBackTypeMapper"
                                ]
        );

        foreach (var (inter, impl) in almasRep)
            services.AddTransient(inter, impl);

        var buildServices = services.BuildServiceProvider();
        ServiceLocator.SetLocatorProvider(buildServices);
    }

    private const string ModulesRoot = "Finnance.Api.Modules";

    private static IEnumerable<(Type inter, Type impl)> GetSouls(string[] layerSuffix, string[] exclude = null)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var classes = from type in assembly.GetExportedTypes()
            where type.Namespace != null
            where !(exclude == null || exclude.Any(ec => type.Namespace.EndsWith(ec)) || exclude.Any(ec => type.Name.StartsWith(ec)))
            where type.IsClass && type.Namespace.StartsWith(ModulesRoot)
                  && layerSuffix.Any(s => type.Namespace.EndsWith(s))
            select (type.GetInterface("I" + type.Name), type);

        return classes;
    }
}
