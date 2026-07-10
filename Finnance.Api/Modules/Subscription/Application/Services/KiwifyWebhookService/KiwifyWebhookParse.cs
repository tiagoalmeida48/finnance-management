using Finnance.Api.Modules.Subscription.Domain.Vo;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using System.Globalization;
using System.Text.Json;

namespace Finnance.Api.Modules.Subscription.Application.Services;

public partial class KiwifyWebhookService
{
    private static KiwifyEventVo Parse(string rawBody)
    {
        try
        {
            using var doc = JsonDocument.Parse(rawBody);
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object)
                throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookPayload);

            var vo = new KiwifyEventVo
            {
                EventType = GetString(root, "webhook_event_type"),
                OrderId = GetString(root, "order_id"),
                OrderStatus = GetString(root, "order_status"),
                SubscriptionId = GetString(root, "subscription_id"),
                SourceEventAt = GetDate(root, "updated_at")
                                ?? GetDate(root, "created_at")
                                ?? GetDate(root, "approved_date")
                                ?? DateTime.UtcNow
            };

            if (root.TryGetProperty("Product", out var product))
            {
                vo.ProductId = GetString(product, "product_id");
                vo.ProductName = GetString(product, "product_name");
            }

            if (root.TryGetProperty("Customer", out var customer))
            {
                vo.CustomerEmail = GetString(customer, "email");
                vo.CustomerName = GetString(customer, "full_name");
                vo.CustomerPhone = GetString(customer, "mobile");
            }

            if (root.TryGetProperty("Commissions", out var commissions))
                vo.ChargeAmount = GetCents(commissions, "charge_amount");

            if (root.TryGetProperty("Subscription", out var subscription) && subscription.ValueKind == JsonValueKind.Object)
            {
                if (vo.SubscriptionId.IsEmpty())
                    vo.SubscriptionId = GetString(subscription, "id");

                vo.StartDate = GetDate(subscription, "start_date");
                vo.NextPayment = GetDate(subscription, "next_payment");

                if (subscription.TryGetProperty("plan", out var plan) && plan.ValueKind == JsonValueKind.Object)
                {
                    vo.PlanName = GetString(plan, "name");
                    vo.PlanFrequency = GetString(plan, "frequency");
                }
            }

            return vo;
        }
        catch (JsonException)
        {
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookPayload);
        }
    }

    private static string GetString(JsonElement element, string name)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(name, out var prop))
            return null;

        return prop.ValueKind switch
        {
            JsonValueKind.String => prop.GetString(),
            JsonValueKind.Number => prop.GetRawText(),
            _ => null
        };
    }

    private static decimal GetCents(JsonElement element, string name)
    {
        if (element.ValueKind != JsonValueKind.Object || !element.TryGetProperty(name, out var prop))
            return 0;

        if (prop.ValueKind == JsonValueKind.Number && prop.TryGetDecimal(out var number))
            return number / 100m;

        if (prop.ValueKind == JsonValueKind.String
            && decimal.TryParse(prop.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed))
            return parsed / 100m;

        return 0;
    }

    private static DateTime? GetDate(JsonElement element, string name)
    {
        var value = GetString(element, name);
        if (value.IsEmpty())
            return null;

        return DateTime.TryParse(value, CultureInfo.InvariantCulture,
                                 DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var date)
            ? date
            : null;
    }
}
