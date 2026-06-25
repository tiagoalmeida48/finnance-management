using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Npgsql;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Refit;
using System.Net;
using System.Text;

namespace Finnance.Api.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class GlobalErrorHandle : ControllerBase
{
    private const int InternalErrorStatus = 500;
    private const int BusinessErrorStatus = 400;

    private static long TryLog(Exception err)
    {
        _ = err;
        return Constants.DefaultErrorLog;
    }

    [Route("/errors")]
    public ActionResult<ResultApi<object>> Error()
    {
        var ctx = HttpContext.Features.Get<IExceptionHandlerFeature>();

        if (IsDatabaseTimeout(ctx.Error))
        {
            var retErr = new ResultApi<object>
            {
                Message = Constants.ErrorMessage.DatabaseAccessError,
                Success = false,
                InternalError = TryLog(ctx.Error)
            };

            return StatusCode(InternalErrorStatus, retErr);
        }

        if (ctx.Error.InnerException is ApiException apiException && apiException.StatusCode == HttpStatusCode.Unauthorized)
        {
            var retErr = new ResultApi<object>
            {
                Message = Constants.ErrorMessage.ErrorLoginErp,
                Success = false,
                InternalError = TryLog(ctx.Error)
            };

            return StatusCode(InternalErrorStatus, retErr);
        }

        if (ctx.Error is ApplicationException businessError)
        {
            var ret = new ResultApi<object>
            {
                Message = businessError.Message,
                Success = false
            };

            return StatusCode(BusinessErrorStatus, ret);
        }

        if (IsInvalidRequestBody(ctx.Error))
        {
            var retInvalidBody = new ResultApi<object>
            {
                Message = Constants.ErrorMessage.InvalidRequestBody,
                Success = false
            };

            return StatusCode(BusinessErrorStatus, retInvalidBody);
        }

        var retErrNotExpected = new ResultApi<object>
        {
            Message = Constants.ErrorMessage.ErrorNotExpected,
            InternalError = TryLog(ctx.Error),
            Success = false
        };

        return StatusCode(InternalErrorStatus, retErrNotExpected);
    }

    private static bool IsInvalidRequestBody(Exception exception)
    {
        for (var current = exception; current != null; current = current.InnerException)
        {
            if (current is BadHttpRequestException
                or DecoderFallbackException
                or System.Text.Json.JsonException
                or Newtonsoft.Json.JsonException)
                return true;
        }

        return false;
    }

    private static bool IsDatabaseTimeout(Exception exception)
    {
        return exception switch
        {
            SqlException sqlEx => sqlEx.Number == Constants.ErrorTimeOut,
            PostgresException pgEx => pgEx.SqlState is Constants.PostgreSqlTimeoutCode or Constants.PostgreSqlConnectionTimeoutCode,
            _ => false
        };
    }
}
