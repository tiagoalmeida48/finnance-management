using Microsoft.AspNetCore.Mvc;
using Finnance.Api.Security;

namespace Finnance.Api.Controllers;

[Route("api/[controller]/[action]")]
public class ControllerBase : Microsoft.AspNetCore.Mvc.ControllerBase
{
    public (long user, string language, string timeZone) UserLogged => HttpContext.GetUserLogged();
    public (string schema, string token) Token => HttpContext.GetToken();
}