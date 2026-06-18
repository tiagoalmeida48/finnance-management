namespace Finnance.Api.Modules.Common.Domain.Vo;

public class SessionVo
{
    public bool Authenticated { get; set; }
    public string Login { get; set; }
    public long User { get; set; }
    public string Name { get; set; }
    public string Token { get; set; }
    public string Idiom { get; set; }
    public string Platform { get; set; }

    public bool RequireMfa { get; set; }
}