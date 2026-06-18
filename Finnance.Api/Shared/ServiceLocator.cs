using Microsoft.Extensions.DependencyInjection;

namespace Finnance.Api.Shared;

public class ServiceLocator
{
    private static IServiceProvider _serviceProvider;

    public static void SetLocatorProvider(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public static object GetInstance(Type serviceType)
    {
        return _serviceProvider.GetService(serviceType);
    }

    public static TService GetInstance<TService>()
    {
        return _serviceProvider.GetService<TService>();
    }
}