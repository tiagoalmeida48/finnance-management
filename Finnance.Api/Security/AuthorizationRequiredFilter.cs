using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Finnance.Api.Shared.Utils;

namespace Finnance.Api.Security;

public sealed class AuthorizationRequiredFilter : IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        if (context.ActionDescriptor is not ControllerActionDescriptor action)
            throw new ApplicationException(Constants.ErrorMessage.ErrorAccess);

        var methodAnonymous = action.MethodInfo.IsDefined(typeof(AllowAnonymousAttribute), true);
        var controllerAnonymous = action.ControllerTypeInfo.IsDefined(typeof(AllowAnonymousAttribute), true);
        if (methodAnonymous || controllerAnonymous) return;

        var methodAuthorized = action.MethodInfo.IsDefined(typeof(AuthorizationAttribute), true);
        var controllerAuthorized = action.ControllerTypeInfo.IsDefined(typeof(AuthorizationAttribute), true);
        if (!methodAuthorized && !controllerAuthorized)
            throw new ApplicationException(Constants.ErrorMessage.ErrorAccess);
    }
}
