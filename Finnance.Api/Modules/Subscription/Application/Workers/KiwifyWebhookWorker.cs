using Finnance.Api.Modules.Subscription.Application.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Subscription.Application.Workers;

public sealed class KiwifyWebhookWorker(IServiceScopeFactory scopeFactory,
                                         IConfiguration configuration,
                                         ILogger<KiwifyWebhookWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var settings = KiwifySettings.From(configuration);
        var lastMaintenance = DateTime.MinValue;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IKiwifyWebhookService>();
                service.ProcessPending();
                if (DateTime.UtcNow - lastMaintenance >= TimeSpan.FromMinutes(5))
                {
                    service.RunMaintenance();
                    lastMaintenance = DateTime.UtcNow;
                }
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Falha no processamento assíncrono dos webhooks da Kiwify");
            }

            await Task.Delay(TimeSpan.FromSeconds(settings.WorkerIntervalSeconds), stoppingToken);
        }
    }
}
