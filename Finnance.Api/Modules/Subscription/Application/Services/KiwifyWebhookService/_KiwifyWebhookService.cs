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
                                          IConfiguration configuration)
    : BaseService<KiwifyWebhookEventEntity>(kiwifyWebhookEventRepository), IKiwifyWebhookService
{
    public long ProcessWebhook(string rawBody, string signature)
    {
        ValidateSignature(rawBody, signature);

        var data = Parse(rawBody);
        var evt = new KiwifyWebhookEventEntity
        {
            EventType = data.EventType,
            KiwifyOrderId = data.OrderId,
            KiwifySubscriptionId = data.SubscriptionId,
            CustomerEmail = data.CustomerEmail,
            Payload = rawBody
        };
        evt.ValidateCreate();

        using (var tran = GetTransaction())
        {
            evt.KiwifyWebhookEvent = kiwifyWebhookEventRepository.Create(evt);
            tran.Complete();
        }

        Apply(evt, data);
        return evt.KiwifyWebhookEvent;
    }

    public bool Reprocess(long kiwifyWebhookEvent)
    {
        var evt = kiwifyWebhookEventRepository.Search(kiwifyWebhookEvent: kiwifyWebhookEvent, quantity: 1).FirstOrDefault();
        if (evt == null)
            throw new ApplicationException(Constants.ErrorMessage.WebhookEventNotFound);

        var data = Parse(evt.Payload);
        Apply(evt, data);
        return evt.Processed;
    }

    public List<KiwifyWebhookEventEntity> ListEvents(bool onlyUnprocessed = false, int quantity = 0)
    {
        return kiwifyWebhookEventRepository.Search(onlyUnprocessed: onlyUnprocessed, quantity: quantity);
    }

    public int ReprocessPendingByEmail(string email)
    {
        if (email.IsEmpty())
            return 0;

        var pending = kiwifyWebhookEventRepository.Search(onlyUnprocessed: true, customerEmail: email)
                                                  .OrderBy(e => e.KiwifyWebhookEvent);
        var count = 0;
        foreach (var evt in pending)
        {
            try
            {
                var data = Parse(evt.Payload);
                Apply(evt, data);
                if (evt.Processed) count++;
            }
            catch (ApplicationException)
            {
            }
        }

        return count;
    }

    private void ValidateSignature(string rawBody, string signature)
    {
        var token = configuration["Kiwify:WebhookToken"];
        if (token.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.WebhookTokenNotConfigured);

        if (rawBody.IsEmpty() || signature.IsEmpty())
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookSignature);

        using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(token));
        var computed = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody))).ToLowerInvariant();

        var valid = CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(computed),
                                                            Encoding.UTF8.GetBytes(signature.Trim().ToLowerInvariant()));
        if (!valid)
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookSignature);
    }

    private void Apply(KiwifyWebhookEventEntity evt, KiwifyEventVo data)
    {
        try
        {
            var (processed, error, user) = ApplyCore(data);
            evt.Processed = processed;
            evt.ProcessError = error;
            evt.User = user;
        }
        catch (ApplicationException ex)
        {
            evt.Processed = false;
            evt.ProcessError = ex.Message;
        }

        using var tran = GetTransaction();
        kiwifyWebhookEventRepository.Update(evt);
        tran.Complete();
    }

    private (bool processed, string error, long? user) ApplyCore(KiwifyEventVo data)
    {
        if (data.EventType.IsEmpty() || !EventChangesSubscription(data.EventType))
            return (true, null, null);

        var configuredProduct = configuration["Kiwify:ProductId"];
        if (!configuredProduct.IsEmpty() && !data.ProductId.IsEmpty()
            && !string.Equals(configuredProduct, data.ProductId, StringComparison.OrdinalIgnoreCase))
            return (true, null, null);

        if (data.CustomerEmail.IsEmpty())
            return (false, "Payload sem e-mail do cliente.", null);

        var user = userRepository.Search(email: data.CustomerEmail, quantity: 1).FirstOrDefault();
        if (user == null)
        {
            if (data.EventType != Constants.KiwifyEvent.OrderApproved)
                return (false, $"Nenhum usuário cadastrado com o e-mail {data.CustomerEmail}.", null);

            user = userService.ProvisionFromPurchase(data.CustomerEmail, data.CustomerName);
        }
        else if (!user.Active && data.EventType == Constants.KiwifyEvent.OrderApproved)
        {
            user.Active = true;
            using var tran = GetTransaction();
            userRepository.Update(user);
            tran.Complete();
        }

        if (data.SubscriptionId.IsEmpty())
            return (false, "Payload sem identificador de assinatura.", user.User);

        UpsertSubscription(data, user.User);
        return (true, null, user.User);
    }

    private void UpsertSubscription(KiwifyEventVo data, long userId)
    {
        var current = subscriptionRepository.Search(kiwifySubscriptionId: data.SubscriptionId, quantity: 1).FirstOrDefault()
                      ?? new SubscriptionEntity { KiwifySubscriptionId = data.SubscriptionId, Active = true };

        var newStatus = MapStatus(data.EventType, current.SubscriptionStatus);
        if (current.Subscription > 0 && IsTerminalStatus(current.SubscriptionStatus) && !IsTerminalStatus(newStatus))
            newStatus = current.SubscriptionStatus;

        current.User = userId;
        current.SubscriptionStatus = newStatus;
        current.KiwifyOrderId = data.OrderId.IsEmpty() ? current.KiwifyOrderId : data.OrderId;
        current.KiwifyProductId = data.ProductId.IsEmpty() ? current.KiwifyProductId : data.ProductId;
        current.KiwifyProductName = data.ProductName.IsEmpty() ? current.KiwifyProductName : data.ProductName;
        current.CustomerEmail = data.CustomerEmail;
        current.PlanName = data.PlanName.IsEmpty() ? current.PlanName : data.PlanName;
        current.PlanFrequency = data.PlanFrequency.IsEmpty() ? current.PlanFrequency : data.PlanFrequency;
        current.ChargeAmount = data.ChargeAmount > 0 ? data.ChargeAmount : current.ChargeAmount;
        current.StartDate = data.StartDate ?? current.StartDate;
        current.NextPayment = data.NextPayment ?? current.NextPayment;
        current.LastEventAt = DateTime.Now;

        if (current.SubscriptionStatus == Constants.SubscriptionStatusId.CANCELED)
            current.CanceledAt ??= DateTime.Now;
        else if (current.SubscriptionStatus == Constants.SubscriptionStatusId.ACTIVE)
            current.CanceledAt = null;

        using var tran = GetTransaction();
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
        tran.Complete();
    }

    private static bool IsTerminalStatus(long status)
    {
        return status is Constants.SubscriptionStatusId.CANCELED
            or Constants.SubscriptionStatusId.REFUNDED
            or Constants.SubscriptionStatusId.CHARGEBACK;
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
            _ => currentStatus > 0 ? currentStatus : Constants.SubscriptionStatusId.ACTIVE
        };
    }
}
