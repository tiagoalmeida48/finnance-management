using Finnance.Api.Modules.Subscription.Domain.Entities;
using Finnance.Api.Modules.Subscription.Domain.Vo;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Modules.Subscription.Application.Services;

public partial class KiwifyWebhookService
{
    private void ProcessEvent(KiwifyWebhookEventEntity entity)
    {
        try
        {
            entity.User = ApplyCore(ToEventVo(entity));
            CompleteEvent(entity, true, null);
        }
        catch (ApplicationException exception)
        {
            logger.LogWarning("Webhook Kiwify {WebhookEvent} rejeitado: {Reason}", entity.KiwifyWebhookEvent, exception.Message);
            CompleteEvent(entity, true, exception.Message);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Falha ao processar webhook Kiwify {WebhookEvent}", entity.KiwifyWebhookEvent);
            CompleteEvent(entity, false, Constants.ErrorMessage.WebhookProcessingFailed);
        }
    }

    private long? ApplyCore(KiwifyEventVo data)
    {
        if (!EventChangesSubscription(data.EventType)) return null;

        ValidateEvent(data, KiwifySettings.From(configuration));
        var user = userRepository.Search(email: data.CustomerEmail, quantity: 1).FirstOrDefault();
        if (user == null)
        {
            if (data.EventType != Constants.KiwifyEvent.OrderApproved)
                throw new ApplicationException(Constants.ErrorMessage.WebhookUserNotFound);

            user = userService.ProvisionFromPurchase(data.CustomerEmail, data.CustomerName, data.CustomerPhone);
        }
        else
            userService.SyncPhoneFromPurchase(user.User, data.CustomerPhone);

        UpsertSubscription(data, user.User);
        userRepository.SyncSubscriptionBlocks(KiwifySettings.From(configuration).GraceDays);
        return user.User;
    }

    private static void ValidateEvent(KiwifyEventVo data, KiwifySettings settings)
    {
        if (data.ProductId.IsEmpty()
            || !string.Equals(settings.ProductId, data.ProductId, StringComparison.OrdinalIgnoreCase))
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookProduct);

        if (data.CustomerEmail.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.WebhookCustomerRequired);

        if (data.SubscriptionId.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.WebhookSubscriptionRequired);

        if (!GrantsAccess(data.EventType)) return;

        if (!string.Equals(data.OrderStatus, "paid", StringComparison.OrdinalIgnoreCase))
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookOrderStatus);

        if (data.NextPayment == null)
            throw new ApplicationException(Constants.ErrorMessage.WebhookEntitlementRequired);
    }

    private void UpsertSubscription(KiwifyEventVo data, long userId)
    {
        var current = subscriptionRepository.Search(kiwifySubscriptionId: data.SubscriptionId, quantity: 1).FirstOrDefault()
                      ?? new SubscriptionEntity { KiwifySubscriptionId = data.SubscriptionId, Active = true };

        if (!CanApplyEvent(current.SourceEventAt, data.SourceEventAt)) return;

        current.User = userId;
        current.SubscriptionStatus = MapStatus(data.EventType, current.SubscriptionStatus);
        current.KiwifyOrderId = data.OrderId.IsEmpty() ? current.KiwifyOrderId : data.OrderId;
        current.KiwifyProductId = data.ProductId;
        current.KiwifyProductName = data.ProductName.IsEmpty() ? current.KiwifyProductName : data.ProductName;
        current.CustomerEmail = data.CustomerEmail;
        current.PlanName = data.PlanName.IsEmpty() ? current.PlanName : data.PlanName;
        current.PlanFrequency = data.PlanFrequency.IsEmpty() ? current.PlanFrequency : data.PlanFrequency;
        current.ChargeAmount = data.ChargeAmount > 0 ? data.ChargeAmount : current.ChargeAmount;
        current.StartDate = data.StartDate ?? current.StartDate;
        current.NextPayment = data.NextPayment ?? current.NextPayment;
        current.SourceEventAt = data.SourceEventAt;
        current.LastEventAt = DateTime.UtcNow;

        if (GrantsAccess(data.EventType)) current.EntitledUntil = data.NextPayment;

        if (current.SubscriptionStatus == Constants.SubscriptionStatusId.CANCELED)
            current.CanceledAt ??= data.SourceEventAt;
        else if (current.SubscriptionStatus == Constants.SubscriptionStatusId.ACTIVE)
            current.CanceledAt = null;

        using var transaction = GetTransaction();
        if (current.Subscription > 0)
        {
            current.ValidateUpdate();
            subscriptionRepository.Update(current);
        }
        else
        {
            current.ValidateCreate();
            subscriptionRepository.Create(current);
        }
        transaction.Complete();
    }

    private void CompleteEvent(KiwifyWebhookEventEntity entity, bool processed, string error)
    {
        entity.Processed = processed;
        entity.ProcessError = error;
        if (processed)
        {
            entity.CustomerName = null;
            entity.CustomerPhone = null;
        }
        entity.ProcessingAt = null;
        entity.NextAttemptAt = processed
            ? null
            : DateTime.UtcNow.AddMinutes(Math.Min(60, Math.Pow(2, Math.Min(entity.ProcessAttempts, 6))));

        using var transaction = GetTransaction();
        kiwifyWebhookEventRepository.Update(entity);
        transaction.Complete();
    }

    private static KiwifyEventVo ToEventVo(KiwifyWebhookEventEntity entity)
    {
        return new KiwifyEventVo
        {
            EventType = entity.EventType,
            OrderId = entity.KiwifyOrderId,
            OrderStatus = entity.OrderStatus,
            SubscriptionId = entity.KiwifySubscriptionId,
            ProductId = entity.ProductId,
            ProductName = entity.ProductName,
            CustomerEmail = entity.CustomerEmail,
            CustomerName = entity.CustomerName,
            CustomerPhone = entity.CustomerPhone,
            PlanName = entity.PlanName,
            PlanFrequency = entity.PlanFrequency,
            ChargeAmount = entity.ChargeAmount,
            StartDate = entity.StartDate,
            NextPayment = entity.NextPayment,
            SourceEventAt = entity.SourceEventAt
        };
    }

    private static bool GrantsAccess(string eventType)
    {
        return eventType is Constants.KiwifyEvent.OrderApproved or Constants.KiwifyEvent.SubscriptionRenewed;
    }

    private static bool CanApplyEvent(DateTime? currentEventAt, DateTime incomingEventAt)
    {
        return !currentEventAt.HasValue || incomingEventAt >= currentEventAt.Value;
    }

    private static bool EventChangesSubscription(string eventType)
    {
        return eventType is Constants.KiwifyEvent.OrderApproved
            or Constants.KiwifyEvent.OrderRefunded
            or Constants.KiwifyEvent.Chargeback
            or Constants.KiwifyEvent.ChargebackAlt
            or Constants.KiwifyEvent.SubscriptionRenewed
            or Constants.KiwifyEvent.SubscriptionLate
            or Constants.KiwifyEvent.SubscriptionCanceled;
    }

    private static long MapStatus(string eventType, long currentStatus)
    {
        return eventType switch
        {
            Constants.KiwifyEvent.OrderApproved or Constants.KiwifyEvent.SubscriptionRenewed => Constants.SubscriptionStatusId.ACTIVE,
            Constants.KiwifyEvent.SubscriptionLate => Constants.SubscriptionStatusId.LATE,
            Constants.KiwifyEvent.SubscriptionCanceled => Constants.SubscriptionStatusId.CANCELED,
            Constants.KiwifyEvent.OrderRefunded => Constants.SubscriptionStatusId.REFUNDED,
            Constants.KiwifyEvent.Chargeback or Constants.KiwifyEvent.ChargebackAlt => Constants.SubscriptionStatusId.CHARGEBACK,
            _ => currentStatus
        };
    }
}
