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
    public const string ProjectName = "Project Base";
    public const string MfaRequired = "1";

    public class CodeTask
    {
        public const string DELETE_LOG = "DLOG";
        public const string SYNC_DELETE_FILE_ORPHANS = "SDFO";
    }

    public class StatusTask
    {
        public const string Processing = "PRC";
        public const string Finished = "FNS";
        public const string Error = "ERR";
    }

    public class AttachmentType
    {
        public const string Image = "IMG";
        public const string Video = "VID";
        public const string Document = "DOC";
    }

    public static class AttachmentClassification
    {
        public const int ExportCsv = 1;
    }
}