using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.Subscription.Application.Dto;
using Finnance.Api.Modules.Subscription.Application.Interfaces;
using Finnance.Api.Security;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class SubscriptionController(ISubscriptionService subscriptionService, IKiwifyWebhookService kiwifyWebhookService) : ControllerBase
{
    [Authorization()]
    [HttpGet]
    public ResultApi<SubscriptionStatusDto> Me()
    {
        var current = subscriptionService.GetByUser(UserLogged.user);
        var dto = current == null ? new SubscriptionStatusDto() : current.MapTo<SubscriptionStatusDto>();
        dto.HasActiveAccess = subscriptionService.HasActiveAccess(UserLogged.user);
        dto.CheckoutUrl = subscriptionService.GetCheckoutUrl();
        return new ResultApi<SubscriptionStatusDto> { Result = dto };
    }

    [Authorization(admin: true)]
    [HttpGet]
    public ResultApi<List<SubscriptionDisplayDto>> List([FromQuery] long subscriptionStatus = 0)
    {
        var subscriptions = subscriptionService.ListAll(subscriptionStatus);
        return new ResultApi<List<SubscriptionDisplayDto>> { Result = subscriptions.MapTo<List<SubscriptionDisplayDto>>() };
    }

    [Authorization(admin: true)]
    [HttpGet]
    public ResultApi<List<KiwifyWebhookEventDisplayDto>> Events([FromQuery] bool onlyUnprocessed = false, [FromQuery] int quantity = 100)
    {
        var events = kiwifyWebhookService.ListEvents(onlyUnprocessed, quantity);
        return new ResultApi<List<KiwifyWebhookEventDisplayDto>> { Result = events.MapTo<List<KiwifyWebhookEventDisplayDto>>() };
    }

    [Authorization(admin: true)]
    [HttpPost]
    public ResultApi<bool> Reprocess([FromBody] long kiwifyWebhookEvent)
    {
        return new ResultApi<bool> { Result = kiwifyWebhookService.Reprocess(kiwifyWebhookEvent) };
    }
}
