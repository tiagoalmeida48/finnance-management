namespace Finnance.Api.Shared.Utils;

public static partial class Constants
{
    public const int MaxPageSizeLimit = 300;
    public const long MaxRecordsAsync = 1000;
    public const string LanguageDefault = "PTBR";
    public const string PlatformDefault = "WEB";
    public const int ErrorTimeOut = 10060;
    public const string PostgreSqlTimeoutCode = "57014";
    public const string PostgreSqlConnectionTimeoutCode = "08001";
    public const int DefaultErrorLog = 780;
    public const string ErrorErp = "E";
    public const int BytesInMB = 1048576;
    public const int Size1Gb = BytesInMB * 1000;
    public const int None = 0;
    public const string TimeZoneDefault = "America/Sao_Paulo";
    public const string CookieName = "CookieAuth";
    public const string UrlOpenApi = "/openapi";
    public const string UrlSwagger = "/swagger";
    public const string ProjectName = "Finnance";
    public const string MfaRequired = "1";
}