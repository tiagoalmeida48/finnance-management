using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Modules.Subscription.Application.Interfaces;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Controllers;

public class KiwifyWebhookController(IKiwifyWebhookService kiwifyWebhookService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost]
    [RequestSizeLimit(262144)]
    public async Task<ResultApi<long>> Receive([FromQuery] string signature)
    {
        if (!Request.HasJsonContentType())
            throw new ApplicationException(Constants.ErrorMessage.InvalidWebhookContentType);

        using var reader = new StreamReader(Request.Body);
        var rawBody = await reader.ReadToEndAsync();
        var id = kiwifyWebhookService.ProcessWebhook(rawBody, signature);
        return new ResultApi<long> { Result = id };
    }
}
