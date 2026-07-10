using Finnance.Api.Modules.Common.Application.Services;
using Finnance.Api.Modules.Subscription.Application.Interfaces;
using Finnance.Api.Modules.Subscription.Domain.Entities;
using Finnance.Api.Modules.Subscription.Domain.Interfaces;
using Finnance.Api.Modules.Subscription.Domain.Vo;
using Finnance.Api.Modules.User.Application.Interfaces;
using Finnance.Api.Modules.User.Domain.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using System.Security.Cryptography;
using System.Text;

namespace Finnance.Api.Modules.Subscription.Application.Services;

public partial class KiwifyWebhookService(IKiwifyWebhookEventRepository kiwifyWebhookEventRepository,
                                          ISubscriptionRepository subscriptionRepository,
                                          IUserRepository userRepository,
                                          IUserService userService,
                                          IConfiguration configuration,
                                          ILogger<KiwifyWebhookService> logger)
    : BaseService<KiwifyWebhookEventEntity>(kiwifyWebhookEventRepository), IKiwifyWebhookService
{
    public long ProcessWebhook(string rawBody, string signature)
    {
        var settings = KiwifySettings.From(configuration);
        if (!settings.Enabled)
            throw new ApplicationException(Constants.ErrorMessage.KiwifyIntegrationDisabled);

        ValidateSignature(rawBody, signature, settings.WebhookToken);
        var data = Parse(rawBody);
        var entity = CreateEvent(data, rawBody);
        entity.ValidateCreate();
        return kiwifyWebhookEventRepository.CreateIfAbsent(entity);
    }

    public bool Reprocess(long kiwifyWebhookEvent)
    {
        if (!kiwifyWebhookEventRepository.Schedule(kiwifyWebhookEvent))
            throw new ApplicationException(Constants.ErrorMessage.WebhookEventNotFound);

        return true;
    }

    public List<KiwifyWebhookEventEntity> ListEvents(bool onlyUnprocessed = false, int quantity = 0)
    {
        var limit = Math.Clamp(quantity <= 0 ? 100 : quantity, 1, 500);
        return kiwifyWebhookEventRepository.Search(onlyUnprocessed: onlyUnprocessed, quantity: limit);
    }

    public int ProcessPending(int quantity = 20)
    {
        var pending = kiwifyWebhookEventRepository.ClaimPending(quantity);
        foreach (var entity in pending) ProcessEvent(entity);
        return pending.Count;
    }

    public void RunMaintenance()
    {
        var settings = KiwifySettings.From(configuration);
        userRepository.SyncSubscriptionBlocks(settings.GraceDays);
        kiwifyWebhookEventRepository.PurgeProcessed(settings.EventRetentionDays);
    }

    private static KiwifyWebhookEventEntity CreateEvent(KiwifyEventVo data, string rawBody)
    {
        return new KiwifyWebhookEventEntity
        {
            EventType = data.EventType?.Trim().ToLowerInvariant(),
            KiwifyOrderId = data.OrderId,
            KiwifySubscriptionId = data.SubscriptionId,
            CustomerEmail = data.CustomerEmail?.Trim().ToLowerInvariant(),
            CustomerName = data.CustomerName,
            CustomerPhone = data.CustomerPhone,
            OrderStatus = data.OrderStatus?.Trim().ToLowerInvariant(),
            ProductId = data.ProductId,
            ProductName = data.ProductName,
            PlanName = data.PlanName,
            PlanFrequency = data.PlanFrequency,
            ChargeAmount = data.ChargeAmount,
            StartDate = data.StartDate,
            NextPayment = data.NextPayment,
            SourceEventAt = data.SourceEventAt.ToUniversalTime(),
            EventFingerprint = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawBody))).ToLowerInvariant(),
            NextAttemptAt = DateTime.UtcNow
        };
    }

    private static void ValidateSignature(string rawBody, string signature, string token)
    {
        if (rawBody.IsEmpty() || signature.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookSignature);

        using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(token));
        var computed = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody))).ToLowerInvariant();
        var received = signature.Trim().ToLowerInvariant();
        if (computed.Length != received.Length
            || !CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(computed), Encoding.UTF8.GetBytes(received)))
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookSignature);
    }
}
