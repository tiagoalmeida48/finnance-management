namespace Finnance.Api.Modules.Common.Domain.Vo;

public class ApiContextVo
{
    public ApiContextVo(string conn, long user, string language, string timeZone)
    {
        Conn = conn;
        User = user;
        Language = language;
        TimeZone = timeZone;
    }

    public long User { get; set; }
    public string Language { get; set; }
    public string TimeZone { get; set; }
    public string Conn { get; set; }
}