using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using Finnance.Api.Modules.AuditLog.Application.Interfaces;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Security;

public class AuditActionFilter(IAuditLogService auditLogService) : IAsyncActionFilter
{
    private const int MaxDataLength = 8000;

    private static readonly HashSet<string> DenyControllers = new(StringComparer.OrdinalIgnoreCase)
    {
        "Auth", "User", "AuditLog"
    };

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executed = await next();
        TryAudit(context, executed);
    }

    private void TryAudit(ActionExecutingContext context, ActionExecutedContext executed)
    {
        try
        {
            if (executed.Exception != null && !executed.ExceptionHandled)
                return;

            var action = MapAction(context.HttpContext.Request.Method);
            if (action <= 0)
                return;

            var controller = (context.ActionDescriptor as ControllerActionDescriptor)?.ControllerName ?? string.Empty;
            if (controller.IsEmpty() || DenyControllers.Contains(controller))
                return;

            var (user, _, _) = context.HttpContext.GetUserLogged();
            if (user <= 0)
                return;

            auditLogService.Record(action, controller, ExtractRecord(executed.Result), SerializeArguments(context.ActionArguments), user);
        }
        catch
        {
        }
    }

    private static long MapAction(string method)
    {
        if (HttpMethods.IsPost(method))
            return Constants.AuditActionId.INSERT;

        if (HttpMethods.IsPut(method) || HttpMethods.IsPatch(method))
            return Constants.AuditActionId.UPDATE;

        if (HttpMethods.IsDelete(method))
            return Constants.AuditActionId.DELETE;

        return 0;
    }

    private static string SerializeArguments(IDictionary<string, object> arguments)
    {
        if (arguments == null || arguments.Count == 0)
            return null;

        var data = JsonConvert.SerializeObject(arguments);
        return data.Length > MaxDataLength ? data.Substring(0, MaxDataLength) : data;
    }

    private static long ExtractRecord(IActionResult result)
    {
        if (result is ObjectResult obj && obj.Value != null && obj.Value.GetType().GetProperty("Result")?.GetValue(obj.Value) is long id)
            return id;

        return 0;
    }
}
