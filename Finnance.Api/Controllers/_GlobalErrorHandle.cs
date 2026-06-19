using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Npgsql;
using Finnance.Api.Shared;
using Finnance.Api.Shared.Utils;
using Refit;
using System.Net;

namespace Finnance.Api.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class GlobalErrorHandle : ControllerBase
{
    private BusinessError IdentifyError(Exception err)
    {
        var language = Constants.LanguageDefault;

        if (err is BusinessError errTrat)
        {
            if (errTrat.ErrorNumber is not (GeneralErrorNumber.ERROR_ACCESS or GeneralErrorNumber.EXPIRED_TOKEN))
                language = UserLogged.language.IsEmpty() ? Constants.LanguageDefault : UserLogged.language;

            errTrat.Language = language;
            return errTrat;
        }

        var log = TryLog(err);
        return new BusinessError(GeneralErrorNumber.ERROR_NOT_EXPECTED, log) { Language = language };
    }

    private static long TryLog(Exception err)
    {
        // Stub: ILogService do template foi removido na consolidacao.
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
                Message = GeneralErrorNumber.DATABASE_ACCESS_ERROR.ToString(),
                Success = false,
                InternalError = TryLog(ctx.Error)
            };

            return StatusCode((int)GeneralErrorNumber.INTERNAL_ERROR, retErr);
        }

        if (ctx.Error.InnerException is ApiException apiException && apiException.StatusCode == HttpStatusCode.Unauthorized)
        {
            var retErr = new ResultApi<object>
            {
                Message = GeneralErrorNumber.ERROR_LOGIN_ERP.ToString(),
                Success = false,
                InternalError = TryLog(ctx.Error)
            };

            return StatusCode((int)GeneralErrorNumber.INTERNAL_ERROR, retErr);
        }

        var errTrat = IdentifyError(ctx.Error);

        var ret = new ResultApi<object>
        {
            Message = errTrat.TranslatedMessage(),
            InternalError = (int)errTrat.ErrorNumber,
            Success = false
        };

        if (errTrat.ErrorNumber == GeneralErrorNumber.EXPIRED_TOKEN)
            return StatusCode((int)GeneralErrorNumber.EXPIRED_TOKEN, ret);

        if (errTrat.ErrorNumber == GeneralErrorNumber.ERROR_ACCESS)
            return StatusCode((int)GeneralErrorNumber.ERROR_ACCESS, ret);

        return StatusCode((int)GeneralErrorNumber.INTERNAL_ERROR, ret);
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
