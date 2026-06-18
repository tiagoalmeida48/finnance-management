using Finnance.Api.Shared;
using System.Reflection;

namespace Finnance.Api;

public static partial class Configuration
{
    public static void DependencyInjectionConfiguration(this IServiceCollection services)
    {
        // Projeto consolidado: todas as camadas vivem no assembly unico Finnance.Api.
        // Cada feature mora em Finnance.Api.Modules.<Feature>; o registro por reflexao
        // filtra pelo prefixo de modulos + o sufixo da camada (Domain/Application/Repository).

        // DOMAIN
        var soulsDom = GetSouls([".Domain.Services"]);

        foreach (var (inter, impl) in soulsDom)
            services.AddTransient(inter, impl);

        // APPLICATION
        var almasApp = GetSouls([".Application.Services"],
                                ["BaseService", "CsvExportService", "ADExtensionMethods"]
        );

        foreach (var (inter, impl) in almasApp)
            services.AddTransient(inter, impl);

        // REPOSITORY
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

        // var sapSrv = ServiceLocator.GetInstance<IConfigConnectionSapService>();
        // var sapCon = sapSrv.Get();
        //
        // if (sapCon == null)
        //     throw new Exception("Configuração SAP ausente.\n\n");
        //
        // services.AddTransient<SlugifyParameterTransformer.CustomHttpClientHandler>();
        // services.AddRefitClient<IBaseProjectSapApiRest>()
        //         .ConfigurePrimaryHttpMessageHandler<SlugifyParameterTransformer.CustomHttpClientHandler>()
        //         .ConfigureHttpClient((c) =>
        //         {
        //             c.BaseAddress = new Uri(sapCon.Server);
        //             c.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        //             c.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", $"{sapCon.User}:{sapCon.Password}".ToB64Str());
        //             if (sapCon.Client.IsNotEmpty())
        //                 c.DefaultRequestHeaders.Add("Sap-client", sapCon.Client);
        //
        //             c.Timeout = TimeSpan.FromSeconds(60);
        //         });
    }

    private const string ModulesRoot = "Finnance.Api.Modules";

    private static IEnumerable<(Type inter, Type impl)> GetSouls(string[] layerSuffix, string[] exclude = null)
    {
        // Assembly unico do projeto consolidado. Cada feature mora em
        // Finnance.Api.Modules.<Feature>; casamos o prefixo de modulos com o
        // sufixo da camada (ex.: ".Repository.Repositories") para varrer todas as features.
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